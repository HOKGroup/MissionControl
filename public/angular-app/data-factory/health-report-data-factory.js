angular.module('MissionControlApp').factory('HealthReportFactory', HealthReportFactory);

function HealthReportFactory(UtilityService){
    return {
        processFamilyStats: function processFamilyStats(data){
            if(!data) return;

            var misnamed = 0;
            data.families.forEach(function(item){
                if(item.name.indexOf('_HOK_I') === -1 && item.name.indexOf('_HOK_M') === -1){
                    misnamed++;
                }
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

            return {
                misnamed: misnamed,
                inPlaceFamilies: data.inPlaceFamilies,
                unusedFamilies: data.unusedFamilies,
                oversizedFamilies: data.oversizedFamilies,
                scoreData: familyScoreData,
                familyScore: familyScore,
                description: desc,
                name: "Families:"
            };
        },

        processLinkStats: function (data) {
            if(!data) return;

            var passingChecks = 0;
            data.totalImportedDwg === 0
                ? passingChecks += 2
                : passingChecks += 0;
            data.unusedLinkedImages === 0
                ? passingChecks += 2
                : data.unusedLinkedImages <= 2
                ? passingChecks += 1
                : passingChecks += 0;
            data.totalImportedStyles <= 25
                ? passingChecks += 2
                : data.totalImportedStyles > 25 && data.totalImportedStyles <= 50
                ? passingChecks + 1
                : passingChecks += 0;

            var linkScoreData = {
                passingChecks: passingChecks,
                count: data.totalImportedDwg,
                label: "Revit Links",
                newMax: 6};

            var desc = "Revit allows linking of external content. However, excessively linking of RVT/DWG/NWC files " +
                "can impact file performance even if the file is otherwise well maintained. Each linked model should " +
                "be placed on its own Workset to allow it to be closed, and conserve resources. Models should under no " +
                "circumstances be imported.";

            return {
                importedContentCount: data.totalImportedDwg,
                unusedImageCount: data.unusedLinkedImages,
                importedObjectStylesCount: data.totalDwgStyles + data.totalImportedStyles,
                scoreData: linkScoreData,
                importedFiles: data.importedDwgFiles,
                linkScore: linkScoreData.passingChecks,
                description: desc,
                name: "Links:"
            };
        },

        processViewStats: function (data) {
            if(!data) return;

            var viewsNotOnSheet = data.totalViews - data.viewsOnSheet;
            var schedulesOnSheet = data.totalSchedules - data.schedulesOnSheet;

            // Percentage of views not on sheet
            var viewsNotOnSheetsP = parseFloat((viewsNotOnSheet * 100) / data.totalViews).toFixed(0);
            var schedulesNotOnSheetsP = parseFloat((schedulesOnSheet * 100) / data.totalSchedules).toFixed(0);

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

            var templateValue = parseFloat((data.viewsOnSheetWithTemplate * 100) / data.viewsOnSheet).toFixed(0);
            templateValue >= 80
                ? passingChecks += 2
                : templateValue > 70 && templateValue <= 80
                ? passingChecks += 1
                : passingChecks += 0;

            data.unclippedViews <= 20
                ? passingChecks += 2
                : passingChecks += 0;

            var viewScoreData = {
                passingChecks: passingChecks,
                count: data.totalViews,
                label: "Views",
                newMax: 8};

            // (Konrad) This score needs to be remaped to 0-6 range
            var viewScore = Math.round((passingChecks * 6)/8);

            var desc = 'Revit allows for the quick creation of views within the model. An excessive number of views, ' +
                'however, can increase file size and impact performance. Please keep the number of "working views" ' +
                'to minimum in order to preserve your computer hardware resources.';

            return {
                unclippedViews: data.unclippedViews,
                viewsNotOnSheets: viewsNotOnSheetsP,
                schedulesNotOnSheet: schedulesNotOnSheetsP,
                totalViews: data.totalViews,
                viewsOnSheetWithTemplate: templateValue,
                scoreData: viewScoreData,
                viewScore: viewScore,
                description: desc,
                name: "Views:"
            };
        },

        processModelStats: function (data) {
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

            return {
                modelSize: modelSize,
                averageOpenTime: avgOpenTime,
                averageSynchTime: avgSynchTime,
                scoreData: modelScoreData,
                modelScore: 7,
                description: desc,
                name: "Model:"
            };
        },

        processWorksetStats: function (data) {
            if(!data) return;
            if(data.itemCount.length === 0) return;

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

            var itemCount = data.itemCount[data.itemCount.length - 1].worksets;
            itemCount.sort(function(a,b){
                return a.count - b.count;
            }).reverse(); // sorted by count

            // (Konrad) This section collects all data about Workset Item Counts (horizontal bar chart)
            // Returns most recently added workset count information (response.data.itemCount.length-1)
            var worksetItemCountData = itemCount;
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

            return {
                dataWorksetItemCount: worksetItemCountData,
                scoreData: worksetScoreData,
                worksetOpenedData: output,
                worksetCountTotal: worksetCountTotal,
                unusedWorksets: unusedWorksets,
                worksetScore: passingChecks,
                onlyDefaultWorksets: onlyDefaultWorksets,
                contentOnSingleWorkset: contentOnSingleWorkset,
                description: desc,
                name: "Worksets:"
            };
        },

        /**
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

    function SumProperty(items, prop){
        return items.reduce(function (a, b) {
            return a + b[prop];
        }, 0);
    }

    // Calculates totals for each user from aggregated data
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
