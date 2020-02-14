angular.module('MissionControlApp').factory('HealthReportFactory', HealthReportFactory);

function HealthReportFactory(UtilityService, ConfigFactory, ModelsFactory, StylesFactory, LinksFactory, ViewsFactory,
                             WorksetsFactory, FamiliesFactory, GroupsFactory, WarningsFactory){
    return {
        /**
         * This utility method processes information about Families and
         * returns a summary info used to populate the Health Report page.
         * @param data
         * @param callback
         */
        processFamilyStats: function (data, callback){
            var familyStats = {};
            var userNames = [];
            var nameCheckValues = ['HOK_I', 'HOK_M'];

            FamiliesFactory.getFamilyStats(data)
                .then(function (response) {
                    if( !response ||
                        !response.data[0] ||
                        response.data[0].families[0].length === 0 ||
                        response.status !== 201){
                            callback(null);
                            return;
                    }

                    familyStats = response.data[0].families[0];

                    // (Konrad) We need all unique user names of people that ever opened the model.
                    // These will be used to populate dropdowns when assigning tasks. It will allow
                    // us to only assign tasks to people that actually work in the model.
                    var userNamesSet = new Set(response.data[0].opentimes.filter(function (item) {
                        return item.user && item.user !== 'Unknown';
                    }).map(function (item) {
                        return item.user;
                    }));
                    userNames = Array.from(userNamesSet);

                    var centralPath = UtilityService.getHttpSafeFilePath(response.data[0].families[0].centralPath);
                    return ConfigFactory.getByCentralPath(centralPath);
                })
                .then(function (response) {
                    if(!response || response.status !== 200) return;

                    var configuration = response.data[0];
                    if (configuration){
                        nameCheckValues = configuration.updaters.find(function (item) {
                            return item.updaterId === '56603be6-aeb2-45d0-9ebc-2830fad6368b'; //health report updater
                        }).userOverrides.familyNameCheck.values;
                    }

                    // (Konrad) We can finish off processing data here since we should
                    // have all we need by now...
                    var inPlaceFamiliesColor = UtilityService.color().red;
                    var unusedFamiliesColor = UtilityService.color().red;
                    var misnamed = 0;
                    var misnamedFamiliesColor = UtilityService.color().red;
                    var oversizedFamiliesColor = UtilityService.color().red;

                    familyStats.families.forEach(function(item){
                        var result = nameCheckValues.some(function (x) {
                            return item.name.indexOf(x) !== -1;
                        });
                        if (!result) misnamed++;
                    });

                    var passingChecks = 0;
                    if (familyStats.oversizedFamilies <= 10){
                        passingChecks += 2;
                        oversizedFamiliesColor = UtilityService.color().green;
                    } else if (familyStats.oversizedFamilies > 10 && familyStats.oversizedFamilies < 20){
                        passingChecks += 1;
                        oversizedFamiliesColor = UtilityService.color().orange;
                    }
                    if (misnamed <= 10){
                        passingChecks += 2;
                        misnamedFamiliesColor = UtilityService.color().green;
                    } else if (misnamed > 10 && misnamed < 20){
                        passingChecks += 1;
                        misnamedFamiliesColor = UtilityService.color().orange;
                    }
                    if (familyStats.unusedFamilies <= 10){
                        passingChecks += 2;
                        unusedFamiliesColor = UtilityService.color().green;
                    } else if (familyStats.unusedFamilies > 10 && familyStats.unusedFamilies < 20){
                        passingChecks += 1;
                        unusedFamiliesColor = UtilityService.color().orange;
                    }
                    if (familyStats.inPlaceFamilies <= 5){
                        passingChecks += 2;
                        inPlaceFamiliesColor = UtilityService.color().green;
                    } else if (familyStats.inPlaceFamilies > 5 && familyStats.inPlaceFamilies < 10) {
                        passingChecks += 1;
                        inPlaceFamiliesColor = UtilityService.color().orange;
                    }

                    var familyScoreData = {
                        passingChecks: passingChecks,
                        count: familyStats.totalFamilies,
                        label: 'Families',
                        newMax: 8};

                    // (Konrad) This score needs to be remapped to 0-6 range
                    var familyScore = Math.round((passingChecks * 6)/8);

                    var desc = 'Families are integral part of Revit functionality. It is however, important to remember,' +
                        'that oversized (>1MB) families can be a sign of trouble (poorly modeled, imported DWGs etc.). That\'s ' +
                        'why it\'s imperative to follow your company\'s best practices in modeling and naming Revit Families. InPlace families ' +
                        'should be limited in use as they do not allow full functionality of the regular Families.';

                    var bullets = [
                        {
                            title: 'Unplaced Families',
                            description: 'Families are integral part of Revit project. However, unused/unplaced Families ' +
                            'unnecessarily bloat file size and degrade performance. Less than 10 is green, more than ' +
                            '10 but less than 20 is orange while more than 20 is red.',
                            bulletText: familyStats.unusedFamilies,
                            bulletColor: unusedFamiliesColor
                        },
                        {
                            title: 'InPlace Families',
                            description: 'Usage of InPlace families should be limited to minimum possible. InPlace ' +
                            'Families cannot be scheduled, hence limited in traditional usage. They are also constrained ' +
                            'to given model, and cannot be reused on other projects.',
                            bulletText: familyStats.inPlaceFamilies,
                            bulletColor: inPlaceFamiliesColor
                        },
                        {
                            title: 'Misnamed Families',
                            description: 'It\'s considered good practice to use your company\'s created and curated families. ' +
                            'These families will typically have a name containing ' + nameCheckValues.join(', ') + ' in it. Family naming has no ' +
                            'performance impact, but is good practice that should be followed. Less than 10 misnamed families is green, more ' +
                            'than 10 but less than 20 is orange while more than 20 is red.',
                            bulletText: misnamed,
                            bulletColor: misnamedFamiliesColor
                        },
                        {
                            title: 'Oversized Families',
                            description: 'Anything over 1MB will be considered oversized. Large families can be a good ' +
                            'indicator of mis-modelled or families with imported CAD objects. Generally it\'s a good ' +
                            'idea to keep Family file size low. Less than 10 is green, more than 10 but less than 20 ' +
                            'is orange while more than 20 is red.',
                            bulletText: familyStats.oversizedFamilies,
                            bulletColor: oversizedFamiliesColor
                        }
                    ];

                    var color  = UtilityService.color().red;
                    if (passingChecks >= 6){
                        color  = UtilityService.color().green;
                    } else if (passingChecks >= 3 && passingChecks <= 5){
                        color  = UtilityService.color().orange;
                    }

                    callback({
                        nameCheckValues: nameCheckValues,
                        scoreData: familyScoreData,
                        familyScore: familyScore,
                        description: desc,
                        name: 'Families',
                        familyStats: familyStats,
                        bullets: bullets,
                        show: {name: 'families', value: false},
                        color: color,
                        userNames: userNames
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        /**
         * Processes Links Stats data returning data needed to create Health Score graphics.
         * @param data
         * @param callback
         */
        processLinkStats: function (data, callback) {
            LinksFactory.getLinkStats(data)
                .then(function (response) {
                    if( !response || response.status !== 201){
                        callback(null);
                        return;
                    }
                    if( !response.data ||
                        !response.data.linkStats ||
                        response.data.linkStats.length === 0){
                        callback({
                            linkStats: response.data
                        });
                    } else {
                        var data = response.data;
                        var latest = data.linkStats[data.linkStats.length - 1];
                        var importCount = 0;
                        var importCountColor = UtilityService.color().red;
                        var unusedImages = latest.unusedLinkedImages;
                        var unusedImagesColor = UtilityService.color().red;
                        var totalStyles = latest.totalDwgStyles + latest.totalImportedStyles;
                        var totalStylesColor = UtilityService.color().red;

                        latest.importedDwgFiles.forEach(function(item){
                            if(!item.isLinked) importCount++;
                        });

                        var passingChecks = 0;
                        if (importCount === 0){
                            passingChecks += 2;
                            importCountColor = UtilityService.color().green;
                        }
                        if (unusedImages === 0){
                            passingChecks += 2;
                            unusedImagesColor = UtilityService.color().green;
                        } else if (unusedImages <= 2){
                            passingChecks += 1;
                            unusedImagesColor = UtilityService.color().orange;
                        }
                        if (totalStyles <= 25){
                            passingChecks += 2;
                            totalStylesColor = UtilityService.color().green;
                        } else if (totalStyles > 25 && totalStyles <= 50){
                            passingChecks += 1;
                            totalStylesColor = UtilityService.color().orange;
                        }

                        var linkScoreData = {
                            passingChecks: passingChecks,
                            count: latest.totalImportedDwg,
                            label: 'Import Instances',
                            newMax: 6};

                        var desc = 'Excessive linking of RVT/DWG/NWC files ' +
                            'can impact file performance even if the file is otherwise well maintained. Each linked Revit model should ' +
                            'be placed on its own Workset to allow it to be closed, and conserve resources. ' +
                            'This model has ' + (latest.totalLinkedModels - latest.totalLinkedDwg) + ' Linked Revit Models, ' +
                            'and ' + latest.totalLinkedDwg + ' Linked CAD Files. These links were placed ' + latest.totalImportedDwg + ' times.' +
                            '\n*Not all links have to be placed.';

                        var bullets = [
                            {
                                title: 'Imported External Content',
                                description: 'Importing of any DWG/STL/SKP content is considered bad practice. All external ' +
                                'content if necessary should be linked in. Importing content can cause decreased model ' +
                                'performance due to excessive number of Object Styles or decrease accuracy, and cause graphic ' +
                                'artifacts due to large XYZ Coordinates.',
                                bulletText: importCount,
                                bulletColor: importCountColor
                            },
                            {
                                title: 'Unused Imported Images',
                                description: 'Imported image content can increase file size and impact model performance. ' +
                                'It is recommended to periodically purge unused image content from the model.',
                                bulletText: unusedImages,
                                bulletColor: unusedImagesColor
                            },
                            {
                                title: 'Imported Object Styles',
                                description: 'There are typically 276 Object Styles in standard Revit file. Importing DWG ' +
                                'content either directly or into Families may cause this number to grow. Excessive number of ' +
                                'Object Styles that were created via importing of external content can have negative performance impact.',
                                bulletText: totalStyles,
                                bulletColor: totalStylesColor
                            }
                        ];

                        var color  = UtilityService.color().red;
                        if (passingChecks >= 5){
                            color  = UtilityService.color().green;
                        } else if (passingChecks >= 3 && passingChecks <= 4){
                            color  = UtilityService.color().orange;
                        }

                        callback({
                            scoreData: linkScoreData,
                            importedFiles: latest.importedDwgFiles,
                            linkScore: linkScoreData.passingChecks,
                            description: desc,
                            name: 'Links',
                            linkStats: data,
                            bullets: bullets,
                            show: {name: 'links', value: false},
                            color: color
                        });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        /**
         * Processes Styles Stats data returning data needed to create Health Score graphics.
         * @param data
         * @param callback
         */
        processStyleStats: function(data, callback){
            StylesFactory.getStyleStats(data)
                .then(function (response) {
                    if (!response || response.status !== 201){
                        callback(null);
                        return;
                    }
                    if (!response.data ||
                        !response.data.styleStats ||
                        response.data.styleStats.length === 0){
                        callback({
                            styleStats: response.data
                        });
                    } else {
                        var data = response.data;
                        var latest = data.styleStats[0]; //we filter this data on server side so only 1 doc is returned
                        var overridenDimensions = latest.dimSegmentStats.length;
                        var overridenDimensionsColor = UtilityService.color().red;
                        var passingChecks = 0;

                        if (overridenDimensions <= 10){
                            passingChecks += 2;
                            overridenDimensionsColor = UtilityService.color().green;
                        } else if (overridenDimensions > 10 && overridenDimensions <= 20) {
                            passingChecks += 1;
                            overridenDimensionsColor = UtilityService.color().orange;
                        }

                        var usesProjectUnits = true;
                        var usesProjectUnitsColor = UtilityService.color().green;
                        var unusedDimensionTypes = false;
                        var unusedDimensionTypesColor = UtilityService.color().green;
                        var unusedTextTypes = false;
                        var unusedTextTypesColor = UtilityService.color().green;

                        var unusedTypes = 0;
                        for (var i = 0; i < latest.dimStats.length; i++){
                            var dim = latest.dimStats[i];
                            if (dim.instances === 0){
                                unusedTypes += 1;
                                unusedDimensionTypes = true;
                            }
                            if (!dim.usesProjectUnits) usesProjectUnits = false;
                        }
                        for (var j = 0; j < latest.textStats.length; j++){
                            var text = latest.textStats[j];
                            if (text.instances === 0){
                                unusedTypes += 1;
                                unusedTextTypes = true;
                            }
                        }

                        if (usesProjectUnits === true) passingChecks += 2;
                        else usesProjectUnitsColor = UtilityService.color().red;
                        if (unusedDimensionTypes === false) passingChecks += 2;
                        else unusedDimensionTypesColor = UtilityService.color().red;
                        if (unusedTextTypes === false) passingChecks += 2;
                        else unusedTextTypesColor = UtilityService.color().red;

                        var styleScoreData = {
                            passingChecks: passingChecks,
                            count: unusedTypes,
                            label: 'Unused Styles',
                            newMax: 8};

                        // (Konrad) This score needs to be remapped to 0-6 range
                        var styleScore = Math.round((passingChecks * 6)/8);

                        var desc = 'Revit allows users to easily create new Types/Styles. However, too many Types available causes ' +
                            'confusion as to which one to use. Standards disintegrate quickly, and chaos takes reign. Here ' +
                            'we are looking to make sure that there are no excess Types created that are not being used. Also ' +
                            'we are looking at Dimensions and making sure they are not being overridden. That is a bad practice ' +
                            'and should be avoided.';

                        var bullets = [
                            {
                                title: 'Overridden Dimensions',
                                description: 'Overriding actual dimension values can be considered bad practice in certain ' +
                                'conditions. If we are overriding a dimension to indicate that values are all Equal "EQ" or ' +
                                'defining given dimension is someone else\'s scope than it\'s acceptable. Not acceptable is overriding ' +
                                'dimension values to "fudge" them, round them or straight up come up with bogus values that ' +
                                'don\'t reflect the model. Green is less than 10, orange is more than 10 but less than 20 while ' +
                                'more than 20 is red.',
                                bulletText: overridenDimensions,
                                bulletColor: overridenDimensionsColor
                            },
                            {
                                title: 'Dimensions use Project Units',
                                description: 'Dimensions should be using globally defined Project Units instead of Type ' +
                                'specific overrides. Note that there is nothing wrong with using units overrides when wanting ' +
                                'to change from fractional to decimal units etc. However, users often define custom dimension ' +
                                'units in order to round dimensions to different values, which in return can cause some serious ' +
                                'discrepancies for dimension strings spanning across multiple grid lines.',
                                bulletText: usesProjectUnits === true ? 'Yes' : 'No',
                                bulletColor: usesProjectUnitsColor
                            },
                            {
                                title: 'Unused Dimension Types',
                                description: 'There is nothing wrong with creating new Types, however this can lead to ' +
                                'confusion about which are the standard. Confusion can cause chaos and often results with ' +
                                'all available Types actually being used on a project. This is pretty bad for consistency ' +
                                'and readability. If Dimension Types are not being used, they should be deleted.',
                                bulletText: unusedDimensionTypes === true ? 'Yes' : 'No',
                                bulletColor: unusedDimensionTypesColor
                            },
                            {
                                title: 'Unused Text Types',
                                description: 'There is nothing wrong with creating new Types, however this can lead to ' +
                                'confusion about which are the standard. Confusion can cause chaos and often results with ' +
                                'all available Types actually being used on a project. This is pretty bad for consistency ' +
                                'and readability. If Text Types are not being used, they should be deleted.',
                                bulletText: unusedTextTypes === true ? 'Yes' : 'No',
                                bulletColor: unusedTextTypesColor
                            }
                        ];

                        var color  = UtilityService.color().red;
                        if (passingChecks >= 6){
                            color  = UtilityService.color().green;
                        } else if (passingChecks >= 3 && passingChecks <= 5){
                            color  = UtilityService.color().orange;
                        }

                        callback({
                            scoreData: styleScoreData,
                            styleScore: styleScore,
                            description: desc,
                            name: 'Styles',
                            styleStats: data,
                            bullets: bullets,
                            show: {name: 'styles', value: false},
                            color: color
                        });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        /**
         * Processes View Stats data returning data needed to create Health Score graphics.
         * @param data
         * @param callback
         */
        processViewStats: function(data, callback) {
            ViewsFactory.getViewStats(data)
                .then(function (response) {
                    if( !response || response.status !== 201){
                        callback(null);
                        return;
                    }
                    if( !response.data ||
                        !response.data.viewStats ||
                        response.data.viewStats.length < 1){
                        // (Konrad) In case that the specified date range contains no data
                        // we can return the response object only. It has the centralPath
                        // property needed to re-call this filter without crashing.
                        callback({
                            viewStats: response.data
                        });
                    } else {
                        var data = response.data;
                        var latest = data.viewStats[data.viewStats.length - 1];

                        // Percentage of views not on sheet
                        var viewsNotOnSheet = parseFloat(((latest.totalViews - latest.viewsOnSheet) * 100) / latest.totalViews).toFixed(0);
                        var viewsNotOnSheetColor = UtilityService.color().red;
                        var schedulesOnSheet = parseFloat(((latest.totalSchedules - latest.schedulesOnSheet) * 100) / latest.totalSchedules).toFixed(0);
                        var schedulesOnSheetColor = UtilityService.color().red;

                        var passingChecks = 0;
                        if (viewsNotOnSheet <= 20){
                            passingChecks += 2;
                            viewsNotOnSheetColor = UtilityService.color().green;
                        } else if (viewsNotOnSheet > 20 && viewsNotOnSheet <= 40){
                            passingChecks += 1;
                            viewsNotOnSheetColor = UtilityService.color().orange;
                        }

                        if (schedulesOnSheet <= 20){
                            passingChecks += 2;
                            schedulesOnSheetColor = UtilityService.color().green;
                        } else if (schedulesOnSheet > 20 && schedulesOnSheet <= 40){
                            passingChecks += 1;
                            schedulesOnSheetColor = UtilityService.color().orange;
                        }

                        var unclippedViews = latest.unclippedViews;
                        var unclippedViewsColor = UtilityService.color().red;
                        if (unclippedViews <= 10){
                            passingChecks += 2;
                            unclippedViewsColor = UtilityService.color().green;
                        } else if (unclippedViews > 10 && unclippedViews <= 20){
                            passingChecks += 1;
                            unclippedViewsColor = UtilityService.color().orange;
                        }

                        var templateValue = parseFloat((latest.viewsOnSheetWithTemplate * 100) / latest.viewsOnSheet).toFixed(0);
                        var templateValueColor = UtilityService.color().red;

                        if (templateValue >= 80){
                            passingChecks += 2;
                            templateValueColor = UtilityService.color().green;
                        } else if (templateValue > 70 && templateValue <= 80){
                            templateValueColor = UtilityService.color().orange;
                        }

                        var viewScoreData = {
                            passingChecks: passingChecks,
                            count: latest.totalViews,
                            label: 'Views',
                            newMax: 8};

                        // (Konrad) This score needs to be remapped to 0-6 range
                        var viewScore = Math.round((passingChecks * 6)/8);

                        var desc = 'Revit allows for the quick creation of views within the model. An excessive number of views, ' +
                            'however, can increase file size and impact performance. Please keep the number of "working views" ' +
                            'to minimum in order to preserve your computer hardware resources.';

                        var color  = UtilityService.color().red;
                        if (passingChecks >= 6){
                            color  = UtilityService.color().green;
                        } else if (passingChecks >= 3 && passingChecks <= 5){
                            color  = UtilityService.color().orange;
                        }

                        var bullets = [
                            {
                                title: 'Views not on Sheet',
                                description: 'Creating excessive amount of "working views" can bloat file size and slow down ' +
                                'model performance. A score is assigned based on percentage of Views not on Sheets. Less than ' +
                                '20% is Green, more than 20% but less than 40% is Orange while more than 40% is Red.',
                                bulletText: viewsNotOnSheet + ' %',
                                bulletColor: viewsNotOnSheetColor
                            },
                            {
                                title: 'Schedules not on Sheet',
                                description: 'Schedules represent live model data, and are updated in real time. Excessive ' +
                                'amount of unused Schedules can bloat file size and slow down model performance. A score is ' +
                                'assigned based on percentage of Views not on Sheets. Less than 20% is Green, more than 20% ' +
                                'but less than 40% is Orange while more than 40% is Red.',
                                bulletText: schedulesOnSheet + ' %',
                                bulletColor: schedulesOnSheetColor
                            },
                            {
                                title: 'Unclipped Views',
                                description: 'Plan, Section, Elevation and 3D Views in Revit can be "clipped". This feature ' +
                                'of Revit allows for limiting the amount of content that is rendered for each View, hence can ' +
                                'increase performance when used. All Views should have Clipping Plane set to either "Clipped ' +
                                'without Line" or "Clipped with Line".',
                                bulletText: unclippedViews,
                                bulletColor: unclippedViewsColor
                            },
                            {
                                title: 'Views w/ View Template',
                                description: 'It\'s considered a good practice to apply View Templates to all Views that are ' +
                                'placed on Sheets. This ensures consistent graphics across all drawings. Less than 70% is red, ' +
                                'more than 70% but less than 80% is orange while more than 80% is green.',
                                bulletText: templateValue + ' %',
                                bulletColor: templateValueColor
                            }
                        ];

                        callback({
                            totalViews: latest.totalViews,
                            scoreData: viewScoreData,
                            viewScore: viewScore,
                            description: desc,
                            name: 'Views',
                            viewStats: data,
                            bullets: bullets,
                            show: {name: 'views', value: false},
                            color: color
                        });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        /**
         * Processes Model Stats data returning data needed to create Health Score graphics.
         * @param data
         * @param callback
         */
        processModelStats: function(data, callback) {
            var cp = data.centralPath;
            ModelsFactory.getModelsData(data)
                .then(function (response) {
                    if(!response || !response.data || response.status !== 201){
                        callback(null);
                        return;
                    }
                    if( response.data[0].opentimes.length <= 2 ||
                        response.data[0].synchtimes.length <= 2 ||
                        response.data[0].modelsizes.length <= 2 ||
                        response.data[0].onopened.length <= 2 ||
                        response.data[0].onsynched.length <= 2){
                        // (Konrad) In case that the specified date range contains no data
                        // we can return the response object only. It has the centralPath
                        // property needed to re-call this filter without crashing.
                        callback({
                            modelStats: {
                                modelSizes: response.data[0].modelsizes,
                                openTimes: response.data[0].opentimes,
                                synchTimes: response.data[0].synchtimes,
                                onOpened: response.data[0].onopened,
                                onSynched: response.data[0].onsynched,
                                centralPath: cp
                            }
                        });
                    } else {
                        // (Konrad) Due to how aggregation model works when data is retrieved
                        // it comes in nested under an extra field. This simplifies it for later
                        var data = {
                            modelSizes: response.data[0].modelsizes,
                            openTimes: response.data[0].opentimes,
                            synchTimes: response.data[0].synchtimes,
                            onOpened: response.data[0].onopened,
                            onSynched: response.data[0].onsynched,
                            centralPath: cp
                        };

                        var modelSize = UtilityService.formatNumber(data.modelSizes[data.modelSizes.length-1].value);
                        var avgOpenTime = UtilityService.formatDuration(SumProperty(data.openTimes, 'value') / data.openTimes.length);
                        var avgSynchTime = UtilityService.formatDuration(SumProperty(data.synchTimes, 'value') / data.openTimes.length);

                        var modelScoreData = {
                            passingChecks: 7,
                            count: modelSize,
                            label: 'Model Size',
                            newMax: 6
                        };

                        var desc = 'There are a few simple measurements that we can use to judge model speed and responsiveness. ' +
                            'The good rule of thumb is to keep the model size smaller than 200Mb and that will help increase both ' +
                            'open and synch times. Model size is also a good early indicator that something bad has happened to ' +
                            'the model - it\'s size can increase significantly if we link and/or explode DWG/STL content.';

                        var bullets = [
                            {
                                title: 'Model Size',
                                description: 'It\'s best practice to keep the model size under 200MB. It helps preserve your ' +
                                'hardware resources, and potentially increase model open and synch times. Model Size is often a ' +
                                'good indicator of potential modeling issues. Use of imported objects like DWG or STL often bloats ' +
                                'model size giving Model Managers clues about potential issues.',
                                bulletText: modelSize,
                                bulletColor: UtilityService.color().grey
                            },
                            {
                                title: 'Average Open Time',
                                description: 'This is not a measure of model health, but rather a glance at potential user ' +
                                '"discomfort". Users tend to get frustrated at time lost, while waiting for the model to open. ' +
                                'If we can minimize that time, they will be able to spend it doing more meaningful things, ' +
                                'than waiting for Revit to open. Potential ways to speed up the model opening time, is to ' +
                                'minimize amount of plug-ins that are being loaded at startup.',
                                bulletText: avgOpenTime,
                                bulletColor: UtilityService.color().grey
                            },
                            {
                                title: 'Average Synch Time',
                                description: 'This is not a measure of model health, but rather a glance at potential user ' +
                                '"discomfort". Users tend to get frustrated at time lost, while waiting for the model to synch. ' +
                                'Synch time can be decreased by reducing number of warnings in the model, model size, number ' +
                                'of links etc. All of these things contribute to time that is being needed by Revit to reconcile ' +
                                'all of the changes. Another quick way to minimize synch time, is to Reload Latest before Synchronizing.',
                                bulletText: avgSynchTime,
                                bulletColor: UtilityService.color().grey
                            }
                        ];

                        callback({
                            scoreData: modelScoreData,
                            modelScore: 7,
                            description: desc,
                            name: 'Model',
                            modelStats: data,
                            bullets: bullets,
                            show: {name: 'models', value: false},
                            color: UtilityService.color().grey
                        });
                    }
                }).catch(function (err) {
                    console.log(err.message);
            });
        },

        /**
         * Processes Workset Stats data returning data needed to create Health Score graphics.
         * @param data
         * @param callback
         */
        processWorksetStats: function(data, callback) {
            var cf = data.centralPath;
            WorksetsFactory.getWorksetStats(data)
                .then(function (response) {
                    if( !response || !response.data || response.status !== 201){
                        callback(null);
                        return;
                    }

                    if( response.data[0].onOpened.length <= 2 ||
                        response.data[0].onSynched.length <= 2 ||
                        response.data[0].itemCount.length <= 2){
                            callback({
                                worksetStats: {
                                    onOpened: response.data[0].onOpened,
                                    onSynched: response.data[0].onSynched,
                                    itemCount: response.data[0].itemCount,
                                    centralPath: cf
                                }
                        });
                    } else {
                        var worksetData = {
                            onOpened: response.data[0].onOpened,
                            onSynched: response.data[0].onSynched,
                            itemCount: response.data[0].itemCount,
                            centralPath: cf
                        };
                        var opened = CalculateTotals(worksetData.onOpened);
                        var output = [];
                        opened.forEach(function(item) {
                            output.push({
                                user: item.user,
                                onOpened: (item.opened * 100) / (item.closed + item.opened),
                                onSynched: 0} // this will be filled out later
                            );
                        });

                        var synched = CalculateTotals(worksetData.onSynched);
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
                                return x !== 'user';
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

                        var worksetItemCountData = worksetData.itemCount[0].worksets;
                        worksetItemCountData.sort(function(a,b){
                            return a.count - b.count;
                        }).reverse(); // sorted by count

                        // (Konrad) This section collects all data about Workset Item Counts (horizontal bar chart)
                        // Returns most recently added workset count information (response.data.itemCount.length-1)
                        var onlyDefaultWorksets = 'No';
                        var onlyDefaultWorksetsColor = UtilityService.color().green;
                        var contentOnSingleWorkset = 'No';
                        var contentOnSingleWorksetColor = UtilityService.color().green;
                        var unusedWorksets = 0;
                        var unusedWorksetsColor = UtilityService.color().green;
                        var workset1 = false;
                        var sharedLevels = false;
                        var overallCount = worksetItemCountData.length;
                        var worksetCountTotal = SumProperty(worksetItemCountData, 'count');

                        worksetItemCountData.forEach(function (item) {
                            if(item.count <= 0) unusedWorksets += 1;
                            if(item.name === 'Workset1') workset1 = true;
                            if(item.name === 'Shared Levels and Grids') sharedLevels = true;
                            if((item.count * 100)/worksetCountTotal >= 50) {
                                contentOnSingleWorksetColor = UtilityService.color().red;
                                contentOnSingleWorkset = 'Yes';
                            }
                        });

                        if(workset1 && sharedLevels && overallCount === 2){
                            onlyDefaultWorksetsColor = UtilityService.color().red;
                            onlyDefaultWorksets = 'Yes';
                        }

                        var passingChecks = 0;
                        if(unusedWorksets === 0) {
                            passingChecks += 2;
                        } else {
                            unusedWorksetsColor = UtilityService.color().red;
                        }
                        if(onlyDefaultWorksets === 'No') passingChecks += 2;
                        if(contentOnSingleWorkset === 'No') passingChecks += 2;

                        var worksetScoreData = {
                            passingChecks: passingChecks,
                            count: worksetItemCountData.length,
                            label: 'Worksets',
                            newMax: 6};

                        var desc = 'Only open selected Worksets if possible, to minimize the impact the model will ' +
                            'have on your computer hardware. Many unused Worksets can inhibit performance. Diverging ' +
                            'from best practice use of Worksets would include placing a bulk of the elements on a single ' +
                            'Workset, having many unused Worksets, or using only the default worksets.';

                        var bullets = [
                            {
                                title: 'Unused Worksets',
                                description: 'Unused Worksets are Worksets in the model that have 0 elements on them. It is ' +
                                'detrimental to model performance to create Worksets containing no or very few elements.',
                                bulletText: unusedWorksets,
                                bulletColor: unusedWorksetsColor
                            },
                            {
                                title: 'Using only default Worksets',
                                description: 'Default Worksets are "Shared Levels and Grids" and "Workset1". If model has ' +
                                'only these two Worksets, it\'s likely that it should not be a Workshared model.',
                                bulletText: onlyDefaultWorksets,
                                bulletColor: onlyDefaultWorksetsColor
                            },
                            {
                                title: 'Bulk of content on one Workset',
                                description: 'Bulk of content refers to 50% or more of content being placed on a single ' +
                                'Workset. Turning off Worksets can conserve computer resources and make it run faster. ' +
                                'Keeping all/most of content on a single Workset does not allow for turning them off.',
                                bulletText: contentOnSingleWorkset,
                                bulletColor: contentOnSingleWorksetColor
                            }
                        ];

                        var color  = UtilityService.color().red;
                        if (passingChecks >= 5){
                            color  = UtilityService.color().green;
                        } else if (passingChecks >= 3 && passingChecks <= 4){
                            color  = UtilityService.color().orange;
                        }

                        callback({
                            scoreData: worksetScoreData, //used by circle d3 chart
                            bullets: bullets, //used by bullet points
                            description: desc, // used for the summary text
                            dataWorksetItemCount: worksetItemCountData,
                            worksetOpenedData: output,
                            worksetCountTotal: worksetCountTotal,
                            // worksetScore: passingChecks,
                            name: 'Worksets',
                            color: color,
                            worksetStats: worksetData,
                            show: {name: 'worksets', value: false}
                        });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        /**
         *
         * @param data
         * @param callback
         */
        processWarningStats: function(data, callback){
            if(data.from !== null && data.to !== null){
                WarningsFactory.getByDateRange(data)
                    .then(function (response) {
                        if( !response || !response.data || response.status !== 201){
                            callback(null);
                            return;
                        }
                        if(response.data.length === 0){
                            callback({
                                warningStats: response.data,
                                centralPath: data.centralPath
                            });
                        } else {
                            callback(process(response.data));
                        }
                    }); 
            } else {
                var uri = UtilityService.getHttpSafeFilePath(data.centralPath);
                WarningsFactory.getByCentralPathOpenCount(uri).then(function (response) {
                    if(!response || response.status !== 200){
                        callback(null);
                        return;
                    }
                    if(response.data.length === 0){
                        callback({
                            warningStats: response.data,
                            centralPath: data.centralPath
                        });
                    } else {
                        callback(process({
                            responseData: response.data,
                            centralPath: data.centralPath
                        }));
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            }

            /**
             *
             * @param data
             * @returns {{scoreData: {passingChecks: number, count, label: string, newMax: number}, modelScore: number, description: string, name: string, warningStats: *, bullets: [*], show: {name: string, value: boolean}, color: (boolean|Array|string|number|*)}}
             */
            function process(data) {
                var passingChecks = 0;
                var openWarnings = data.responseData;
                var warningsColor = UtilityService.color().red;

                if (openWarnings <= 15){
                    passingChecks += 2;
                    warningsColor = UtilityService.color().green;
                } else if (openWarnings > 15 && openWarnings <= 30){
                    passingChecks += 1;
                    warningsColor = UtilityService.color().orange;
                }

                var warningScoreData = {
                    passingChecks: passingChecks,
                    count: openWarnings,
                    label: 'Warnings',
                    newMax: 2
                };

                var desc = 'It is a good practice to try and minimize the amount of Warnings present in the model ' +
                    'Some of these warnings might be more of a nuisance than a really harmful thing, but at the ' +
                    'end of the day, they are all objects stored in Revit\'s database, and they all add to time it ' +
                    'takes Revit to Synch, refresh views, print etc. Let\'s make sure that Warnings are kept to minimum.';

                var bullets = [
                    {
                        title: 'Warnings',
                        description: 'This is a total number of Warnings in the model. It\'s a good price to keep that ' +
                        'number to a minimum. Green means number of warnings is less than 15, orange is 15<x<30 while ' +
                        'anything above 30 is red.',
                        bulletText: openWarnings,
                        bulletColor: warningsColor
                    }
                ];

                var color  = UtilityService.color().red;
                if (passingChecks >= 2){
                    color  = UtilityService.color().green;
                } else if (passingChecks >= 1){
                    color  = UtilityService.color().orange;
                }

                return {
                    scoreData: warningScoreData,
                    modelScore: passingChecks,
                    description: desc,
                    name: 'Warnings',
                    warningStats: null,
                    bullets: bullets,
                    show: {name: 'warnings', value: false},
                    color: color,
                    centralPath: data.centralPath
                };
            }
        },


        /**
         *
         * @param data
         * @param callback
         */
        processFullWarningStats: function(data, callback){
            var uri = UtilityService.getHttpSafeFilePath(data.centralPath);
            WarningsFactory.getByCentralPathTimeline(uri).then(function (response) {
                if(!response || response.status !== 200){
                    callback(null);
                    return;
                }
                callback({
                    warningStats: response.data,
                    centralPath: data.centralPath
                });
            }).catch(function (error) {
                console.log(error);
            });
        },

        /**
         *
         * @param data
         * @param callback
         */
        processGroupStats: function(data, callback){
            GroupsFactory.getGroupStats(data)
                .then(function (response) {
                    if( !response || !response.data || response.status !== 201){
                        callback(null);
                        return;
                    }
                    if( response.data.groupStats.length === 0) {
                        callback({
                            modelStats: {
                                groupStats: response.data.groupStats,
                                centralPath: response.data.centralPath
                            }
                        });
                    }
                    else {
                        // (Konrad) Due to how aggregation model works when data is retrieved
                        // it comes in nested under an extra field. This simplifies it for later
                        var data = {
                            groupStats: response.data.groupStats[0],
                            centralPath: response.data.centralPath
                        };

                        var unused = data.groupStats.groups.some(function (item) {
                            return item.instances.length === 0;
                        });
                        var unusedColor = UtilityService.color().red;

                        var modelGroups = 0;
                        var modelGroupsColor = UtilityService.color().red;
                        var detailGroups = 0;
                        var detailGroupsColor = UtilityService.color().red;
                        data.groupStats.groups.forEach(function (item) {
                            if (item.type === 'Model Group') modelGroups++;
                            else detailGroups++;
                        });

                        var passingChecks = 0;
                        if (!unused){
                            passingChecks += 2;
                            unusedColor = UtilityService.color().green;
                        }

                        if (modelGroups <= 10){
                            passingChecks += 2;
                            modelGroupsColor = UtilityService.color().green;
                        } else if (modelGroups > 10 && modelGroups <= 20){
                            passingChecks += 1;
                            modelGroupsColor = UtilityService.color().orange;
                        }

                        if (detailGroups <= 10){
                            passingChecks += 2;
                            detailGroupsColor = UtilityService.color().green;
                        } else if (detailGroups > 10 && detailGroups <= 20){
                            passingChecks += 1;
                            detailGroupsColor = UtilityService.color().orange;
                        }

                        var groupScoreData = {
                            passingChecks: passingChecks,
                            count: data.groupStats.groups.length,
                            label: 'Groups',
                            newMax: 6
                        };

                        var desc = 'It is a good practice to try and avoid use of Groups. They tend to slow down Revit ' +
                            'models quite significantly. Best practice is to convert Model Groups into Families, while ' +
                            'if possible converting Detail Groups into Detail Item Families.';

                        var bullets = [
                            {
                                title: 'Unused Groups',
                                description: 'It\'s not a great idea to have unused model/detail groups in the model' +
                                'they can very much bloat the model. Please purge them when possible.',
                                bulletText: unused ? 'Yes' : 'No',
                                bulletColor: unusedColor
                            },
                            {
                                title: 'Model Groups',
                                description: 'It\'s not a great idea to have an extensive amount of Model Groups in ' +
                                'the model. They consume a significant amount resources and time when regenerating so ' +
                                'can cause severe model slow-downs and even corruption.',
                                bulletText: modelGroups,
                                bulletColor: modelGroupsColor
                            },
                            {
                                title: 'Detail Groups',
                                description: 'It\'s not a great idea to have an extensive amount of Detail Groups in ' +
                                'the model. They can be easily substituted for with Detail Items not to mention that ' +
                                'Revit was meant to be a "modelling" software, not a drafting software. Please use less ' +
                                'Detail Lines and more modeling tools.',
                                bulletText: detailGroups,
                                bulletColor: detailGroupsColor
                            }
                        ];

                        var color  = UtilityService.color().red;
                        if (passingChecks >= 5){
                            color  = UtilityService.color().green;
                        } else if (passingChecks >= 3 && passingChecks <= 4){
                            color  = UtilityService.color().orange;
                        }

                        callback({
                            scoreData: groupScoreData,
                            modelScore: passingChecks,
                            description: desc,
                            name: 'Groups',
                            groupStats: data,
                            bullets: bullets,
                            show: {name: 'groups', value: false},
                            color: color
                        });
                    }
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
                return i.user === item.user;
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
