#region Namespaces
using System;
using System.Collections.Generic;
using System.Diagnostics;
using Autodesk.Revit.ApplicationServices;
using DesignAutomationFramework;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;

using System.Linq;
#endregion

namespace MissionControl.DesignAutomation
{
    [Autodesk.Revit.Attributes.Regeneration(Autodesk.Revit.Attributes.RegenerationOption.Manual)]
    [Transaction(TransactionMode.Manual)]
    public class Command : IExternalDBApplication
    {

        public ExternalDBApplicationResult OnStartup(ControlledApplication app)
        {
            DesignAutomationBridge.DesignAutomationReadyEvent += HandleDesignAutomationReadyEvent;

            return ExternalDBApplicationResult.Succeeded;
        }

        public ExternalDBApplicationResult OnShutdown(ControlledApplication app)
        {
            return ExternalDBApplicationResult.Succeeded;
        }

        public void HandleDesignAutomationReadyEvent(object sender, DesignAutomationReadyEventArgs e)
        {
            // get the application 
            Application app = sender as Application;

            // get the data
            string path = e.DesignAutomationData.FilePath;
            DesignAutomationData data = new DesignAutomationData(app, path);
            
            DeleteViewsNotOnSheets(data.RevitDoc);
            e.Succeeded = true;
        }

        public void DeleteViewsNotOnSheets(Document doc)
        {
            // get all the views in the project
            FilteredElementCollector collector = new FilteredElementCollector(doc).OfClass(typeof(View));
            List<Element> views = collector.Where(v => v.LookupParameter("Sheet Number").AsString() == "---").ToList();

            // start a transaction
            using (Transaction t = new Transaction(doc))
            {
                t.Start();

                // delete all views not on sheets
                foreach (Element e in views)
                {
                    doc.Delete(e.Id);
                }

                // commit the transaction
                t.Commit();
            }

        }



        
    }
    
    
}
