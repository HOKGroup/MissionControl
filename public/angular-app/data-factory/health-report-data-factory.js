angular.module('MissionControlApp').factory('HealthReportFactory', HealthReportFactory);

function HealthReportFactory(UtilityService, ConfigFactory, HealthRecordsFactory, FamiliesFactory){
    return {
        /**
         * This utility method processes information about Families and
         * returns a summary info used to populate the Health Report page.
         * @param id
         * @param callback
         */
        processFamilyStats: function (id, callback){
            var familyStatsId = null;
            var nameCheckValues = ['HOK_I', 'HOK_M'];

            HealthRecordsFactory.getFamilyStats(id)
                .then(function (response) {
                    if(!response || response.status !== 200) return null;

                    familyStatsId = response.data[0].familyStats;
                    var centralPath = UtilityService.getHttpSafeFilePath(response.data[0].centralPath);
                    if(familyStatsId && familyStatsId !== null && familyStatsId !== ''){
                        return ConfigFactory.getByCentralPath(centralPath)
                    }

                    return null;
                })
                .then(function (response) {
                    if(!response || response.status !== 200) return;

                    var configuration = response.data[0];
                    if (configuration){
                        nameCheckValues = configuration.updaters.find(function (item) {
                            return item.updaterId === '56603be6-aeb2-45d0-9ebc-2830fad6368b'; //health report updater
                        }).userOverrides.familyNameCheck.values;
                    }
                    return FamiliesFactory.getById(familyStatsId);
                })
                .then(function (response) {
                    if(!response || response.status !== 200) return;

                    var data = response.data;
                    var misnamed = 0;
                    data.families.forEach(function(item){
                        var result = nameCheckValues.some(function (x) {
                            return item.name.indexOf(x) !== -1;
                        });
                        if (!result) misnamed++;
                    });

                    var passingChecks = 0;
                    data.oversizedFamilies <= 10
                        ? passingChecks += 2
                        : data.oversizedFamilies > 10 && data.oversizedFamilies < 20
                        ? passingChecks += 1
                        : passingChecks += 0;
                    misnamed <= 10
                        ? passingChecks += 2
                        : misnamed > 10 && misnamed < 20
                        ? passingChecks += 1
                        : passingChecks += 0;
                    data.unusedFamilies <= 10
                        ? passingChecks += 2
                        : data.unusedFamilies > 10 && data.unusedFamilies < 20
                        ? passingChecks += 1
                        : passingChecks += 0;
                    data.inPlaceFamilies <= 5
                        ? passingChecks += 2
                        : data.inPlaceFamilies > 5 && data.inPlaceFamilies < 10
                        ? passingChecks += 1
                        : passingChecks += 0;

                    var familyScoreData = {
                        passingChecks: passingChecks,
                        count: data.totalFamilies,
                        label: "Families",
                        newMax: 8};

                    // (Konrad) This score needs to be remaped to 0-6 range
                    var familyScore = Math.round((passingChecks * 6)/8);

                    var desc = "Families are integral part of Revit functionality. It is however, importatnt to remember," +
                        "that oversized (>1MB) families can be a sign of trouble (poorly modeled, imported DWGs etc.). That's " +
                        "why it's imperative to follow HOK's best practices in modeling and naming Revit Families. InPlace families " +
                        "should be limited in use as they do not allow full functionality of the regular Families.";

                    callback({
                        nameCheckValues: nameCheckValues,
                        misnamed: misnamed,
                        inPlaceFamilies: data.inPlaceFamilies,
                        unusedFamilies: data.unusedFamilies,
                        oversizedFamilies: data.oversizedFamilies,
                        scoreData: familyScoreData,
                        familyScore: familyScore,
                        description: desc,
                        name: "Families:",
                        familyStats: data
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        /**
         * Processes Links Stats data returning data needed to create Health Score graphics.
         * @param id
         * @param callback
         */
        processLinkStats: function (id, callback) {

            HealthRecordsFactory.getLinkStats(id)
                .then(function (response) {
                    if(!response || response.status !== 200) return;

                    var data = response.data[0].linkStats;
                    var latest = data[data.length - 1];
                    var importCount = 0;
                    latest.importedDwgFiles.forEach(function(item){
                        if(!item.isLinked) importCount++;
                    });

                    var passingChecks = 0;
                    importCount === 0
                        ? passingChecks += 2
                        : passingChecks += 0;
                    latest.unusedLinkedImages === 0
                        ? passingChecks += 2
                        : latest.unusedLinkedImages <= 2
                        ? passingChecks += 1
                        : passingChecks += 0;

                    var totalStyles = latest.totalDwgStyles + latest.totalImportedStyles;
                    totalStyles <= 25
                        ? passingChecks += 2
                        : totalStyles > 25 && totalStyles <= 50
                        ? passingChecks += 1
                        : passingChecks += 0;

                    var linkScoreData = {
                        passingChecks: passingChecks,
                        count: latest.totalImportedDwg,
                        label: "Import Instances",
                        newMax: 6};

                    var desc = "Excessive linking of RVT/DWG/NWC files " +
                        "can impact file performance even if the file is otherwise well maintained. Each linked Revit model should " +
                        "be placed on its own Workset to allow it to be closed, and conserve resources. " +
                        "This model has " + (latest.totalLinkedModels - latest.totalLinkedDwg) + " Linked Revit Models, " +
                        "and " + latest.totalLinkedDwg + " Linked CAD Files. These links were placed " + latest.totalImportedDwg + " times." +
                        "\n*Not all links have to be placed.";

                    callback({
                        importedContentCount: importCount,
                        unusedImageCount: latest.unusedLinkedImages,
                        importedObjectStylesCount: totalStyles,
                        scoreData: linkScoreData,
                        importedFiles: latest.importedDwgFiles,
                        linkScore: linkScoreData.passingChecks,
                        description: desc,
                        name: "Links:",
                        linkStats: data
                    });
                })
                .catch(function (error) {
                    console.log(error);
                })
        },

        /**
         * Processes Styles Stats data returning data needed to create Health Score graphics.
         * @param id
         * @param callback
         */
        processStyleStats: function(id, callback){

            HealthRecordsFactory.getStyleStats(id)
                .then(function (response) {
                    if (!response || response.status !== 200) return;
                    if (!response.data[0].stylesStats || response.data[0].stylesStats.length === 0) return;

                    var data = response.data[0].styleStats[0];
                    var overridenDimensions = data.dimSegmentStats.length;
                    var passingChecks = 0;
                    overridenDimensions <= 10
                        ? passingChecks += 2
                        : overridenDimensions > 10 && overridenDimensions <= 20
                        ? passingChecks += 1
                        : passingChecks += 0;

                    var usesProjectUnits = true;
                    var unusedDimensionTypes = true;
                    var unusedTextTypes = true;
                    var unusedTypes = 0;
                    for (var i = 0; i < data.dimStats.length; i++){
                        if (i.instances === 0){
                            unusedTypes += 1;
                            unusedDimensionTypes = false;
                        }
                        if (!i.usesProjectUnits) usesProjectUnits = false;
                    }
                    for (var j = 0; j < data.textStats.length; j++){
                        if (j.instances === 0){
                            unusedTypes += 1;
                            unusedTextTypes = false;
                        }
                    }

                    usesProjectUnits === true
                        ? passingChecks += 2
                        : passingChecks += 0;

                    unusedDimensionTypes === false
                        ? passingChecks += 2
                        : passingChecks += 0;

                    unusedTextTypes === false
                        ? passingChecks += 2
                        : passingChecks += 0;

                    var styleScoreData = {
                        passingChecks: passingChecks,
                        count: unusedTypes,
                        label: "Unused Styles",
                        newMax: 8};

                    // (Konrad) This score needs to be remaped to 0-6 range
                    var styleScore = Math.round((passingChecks * 6)/8);

                    var desc = 'Revit allows users to easily create new Types/Styles. However, too many Types available causes ' +
                        'confusion as to which one to use. Standards desintegrate quickly, and chaos takes reign. Here ' +
                        'we are looking to make sure that there are no excess Types created that are not being used. Also ' +
                        'we are looking at Dimensions and making sure they are not being overriden. That is a bad practice ' +
                        'and should be avoided.';

                    callback({
                        overridenDimensions: overridenDimensions,
                        usesProjectUnits: usesProjectUnits === true ? 'Yes' : 'No',
                        unusedDimensionTypes : unusedDimensionTypes === true ? 'Yes' : 'No',
                        unusedTextTypes : unusedTextTypes === true ? 'Yes' : 'No',
                        scoreData: styleScoreData,
                        styleScore: styleScore,
                        description: desc,
                        name: "Styles:",
                        styleStats: data
                    });
                })
                .catch(function (error) {
                    console.log(error);
                })
        },

        /**
         * Processes View Stats data returning data needed to create Health Score graphics.
         * @param id
         * @param callback
         */
        processViewStats: function(id, callback) {

            HealthRecordsFactory.getViewStats(id)
                .then(function (response) {
                    if(!response || response.status !== 200) return;

                    var data = response.data[0].viewStats;
                    var latest = data[data.length - 1];

                    var viewsNotOnSheet = latest.totalViews - latest.viewsOnSheet;
                    var schedulesOnSheet = latest.totalSchedules - latest.schedulesOnSheet;

                    // Percentage of views not on sheet
                    var viewsNotOnSheetsP = parseFloat((viewsNotOnSheet * 100) / latest.totalViews).toFixed(0);
                    var schedulesNotOnSheetsP = parseFloat((schedulesOnSheet * 100) / latest.totalSchedules).toFixed(0);

                    var passingChecks = 0;
                    viewsNotOnSheetsP <= 20
                        ? passingChecks += 2
                        : viewsNotOnSheetsP > 20 && viewsNotOnSheetsP <= 40
                        ? passingChecks += 1
                        : passingChecks += 0;

                    schedulesNotOnSheetsP <= 20
                        ? passingChecks += 2
                        : schedulesNotOnSheetsP > 20 && schedulesNotOnSheetsP <= 40
                        ? passingChecks += 1
                        : passingChecks += 0;

                    var templateValue = parseFloat((latest.viewsOnSheetWithTemplate * 100) / latest.viewsOnSheet).toFixed(0);
                    templateValue >= 80
                        ? passingChecks += 2
                        : templateValue > 70 && templateValue <= 80
                        ? passingChecks += 1
                        : passingChecks += 0;

                    latest.unclippedViews <= 20
                        ? passingChecks += 2
                        : passingChecks += 0;

                    var viewScoreData = {
                        passingChecks: passingChecks,
                        count: latest.totalViews,
                        label: "Views",
                        newMax: 8};

                    // (Konrad) This score needs to be remaped to 0-6 range
                    var viewScore = Math.round((passingChecks * 6)/8);

                    var desc = 'Revit allows for the quick creation of views within the model. An excessive number of views, ' +
                        'however, can increase file size and impact performance. Please keep the number of "working views" ' +
                        'to minimum in order to preserve your computer hardware resources.';

                    callback({
                        unclippedViews: latest.unclippedViews,
                        viewsNotOnSheets: viewsNotOnSheetsP,
                        schedulesNotOnSheet: schedulesNotOnSheetsP,
                        totalViews: latest.totalViews,
                        viewsOnSheetWithTemplate: templateValue,
                        scoreData: viewScoreData,
                        viewScore: viewScore,
                        description: desc,
                        name: "Views:",
                        viewStats: data
                    });
                })
                .catch(function (error) {
                    console.log(error);
                })
        },

        /**
         * Processes Model Stats data returning data needed to create Health Score graphics.
         * @param id
         * @param callback
         */
        processModelStats: function(id, callback) {

            HealthRecordsFactory.getModelStats(id)
                .then(function (response) {
                    if (!response || response.status !== 200) return;

                    var data = response.data;
                    // (Konrad) Since all these are displayed in a chart we need at least two (2) data points.
                    if(data.modelSizes.length <= 1) return;
                    if(data.openTimes.length <= 1) return;
                    if(data.synchTimes.length <= 1) return;

                    var modelSize = UtilityService.formatNumber(data.modelSizes[data.modelSizes.length-1].value);
                    var avgOpenTime = UtilityService.formatDuration(SumProperty(data.openTimes, "value") / data.openTimes.length);
                    var avgSynchTime = UtilityService.formatDuration(SumProperty(data.synchTimes, "value") / data.openTimes.length);

                    var modelScoreData = {
                        passingChecks: 7,
                        count: modelSize,
                        label: "Model Size",
                        newMax: 6};

                    var desc = 'There are a few simple measurements that we can use to judge model speed and responsiveness. ' +
                        'The good rule of thumb is to keep the model size smaller than 200Mb and that will help increase both ' +
                        'open and synch times. Model size is also a good early indicator that something bad has happened to ' +
                        'the model - it\'s size can increase significantly if we link and/or explode DWG/STL content.';

                    callback({
                        modelSize: modelSize,
                        averageOpenTime: avgOpenTime,
                        averageSynchTime: avgSynchTime,
                        scoreData: modelScoreData,
                        modelScore: 7,
                        description: desc,
                        name: "Model:",
                        modelStats: data
                    });
                })
                .catch(function (error) {
                    console.log(error);
                })
        },

        /**
         * Processes Workset Stats data returning data needed to create Health Score graphics.
         * @param id
         * @param callback
         */
        processWorksetStats: function(id, callback) {

            HealthRecordsFactory.getWorksetStats(id)
                .then(function (response) {
                    if(!response || response.status !== 200) return;

                    var data = response.data[0];
                    var opened = CalculateTotals(data.onOpened);
                    var output = [];
                    opened.forEach(function(item) {
                        output.push({
                            user: item.user,
                            onOpened: (item.opened * 100) / (item.closed + item.opened),
                            onSynched: 0} // this will be filled out later
                        )
                    });

                    var synched = CalculateTotals(data.onSynched);
                    synched.forEach(function (item) {
                        var openedObj = output.filter(function(obj){
                            return obj.user === item.user;
                        })[0];
                        if(openedObj){
                            openedObj.onSynched = (item.opened * 100) / (item.closed + item.opened);
                        }
                        else{
                            output.push({
                                user: item.user,
                                onOpened: 0,
                                onSynched: (item.opened * 100) / (item.closed + item.opened)
                            });
                        }
                    });

                    // (Konrad) Process data to append d3 compatible structure
                    var keys = Object.keys(output[0])
                        .filter(function(x){
                            return x !== "user";
                        });

                    output.forEach(function(x){
                        x.values = keys.map(function(name){
                            return {
                                name: name,
                                value: +x[name],
                                user: x.user};
                        });
                    });

                    output.sort(function (a, b){
                        var x = a.user.toLowerCase();
                        var y = b.user.toLowerCase();
                        return x < y ? -1 : x > y ? 1 : 0;
                    }); // sorted by name

                    var worksetItemCountData = data.itemCount[0].worksets;
                    worksetItemCountData.sort(function(a,b){
                        return a.count - b.count;
                    }).reverse(); // sorted by count

                    // (Konrad) This section collects all data about Workset Item Counts (horizontal bar chart)
                    // Returns most recently added workset count information (response.data.itemCount.length-1)
                    var onlyDefaultWorksets = "No";
                    var contentOnSingleWorkset = "No";
                    var unusedWorksets = 0;
                    var workset1 = false;
                    var sharedLevels = false;
                    var overallCount = worksetItemCountData.length;
                    var worksetCountTotal = SumProperty(worksetItemCountData, "count");

                    worksetItemCountData.forEach(function (item) {
                        if(item.count <= 0) unusedWorksets += 1;
                        if(item.name === "Workset1") workset1 = true;
                        if(item.name === "Shared Levels and Grids") sharedLevels = true;
                        if((item.count * 100)/worksetCountTotal >= 50) contentOnSingleWorkset = "Yes";
                    });

                    if(workset1 && sharedLevels && overallCount === 2) onlyDefaultWorksets = "Yes";

                    var passingChecks = 0;
                    if(unusedWorksets === 0) passingChecks += 2;
                    if(onlyDefaultWorksets === "No") passingChecks += 2;
                    if(contentOnSingleWorkset === "No") passingChecks += 2;

                    var worksetScoreData = {
                        passingChecks: passingChecks,
                        count: worksetItemCountData.length,
                        label: "Worksets",
                        newMax: 6};

                    var desc = 'Only open selected Worksets if possible, to minimize the impact the model will ' +
                        'have on your computer hardware. Many unused Worksets can inhibit performance. Diverging ' +
                        'from best practice use of Worksets would include placing a bulk of the elements on a single ' +
                        'Workset, having many unused Worksets, or using only the default worksets.';

                    callback({
                        dataWorksetItemCount: worksetItemCountData,
                        scoreData: worksetScoreData,
                        worksetOpenedData: output,
                        worksetCountTotal: worksetCountTotal,
                        unusedWorksets: unusedWorksets,
                        worksetScore: passingChecks,
                        onlyDefaultWorksets: onlyDefaultWorksets,
                        contentOnSingleWorkset: contentOnSingleWorkset,
                        description: desc,
                        name: "Worksets:",
                        worksetStats: data
                    });

                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        /**
         * Formats file size into proper Mb/kb strings.
         * @return {string}
         */
        formatNumber: function (n) {
        var ranges = [
            { divider: 1.4615016373309029182036848327163e+48 , suffix: 'Pb' },
            { divider: 1208925819614629174706176 , suffix: 'Eb' },
            { divider: 1099511627776 , suffix: 'Tb' },
            { divider: 1073741824 , suffix: 'Gb' },
            { divider: 1048576 , suffix: 'Mb' },
            { divider: 1024 , suffix: 'Kb' } // file size is actually stored in powers of 1024 bytes
        ];

        for (var i = 0; i < ranges.length; i++) {
            if (n >= ranges[i].divider) {
                var value = (n / ranges[i].divider).toFixed(0);
                return value.toString() + ranges[i].suffix;
            }
        }
        return n.toString();
        }
    };

    /**
     *
     * @param items
     * @param prop
     * @returns {*}
     * @constructor
     */
    function SumProperty(items, prop){
        return items.reduce(function (a, b) {
            return a + b[prop];
        }, 0);
    }

    /**
     * Calculates totals for each user from aggregated data.
     * @param data
     * @returns {Array}
     * @constructor
     */
    function CalculateTotals(data){
        var sum = [];
        data.forEach(function(item){
            var existing = sum.filter(function(i){
                return i.user === item.user
            })[0];
            if(!existing){
                sum.push(item);
            } else{
                existing.opened += item.opened;
                existing.closed += item.closed;
            }
        });
        return sum;
    }
}
