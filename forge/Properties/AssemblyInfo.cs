using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

// General Information about an assembly is controlled through the following 
// set of attributes. Change these attribute values to modify the information
// associated with an assembly.
[assembly: AssemblyTitle("MissionControl.DesignAutomation")]
[assembly: AssemblyDescription("")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("Skidmore, Owings & Merrill")]
[assembly: AssemblyProduct("SOM Revit Tools")]
[assembly: AssemblyCopyright("")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]

// Setting ComVisible to false makes the types in this assembly not visible 
// to COM components.  If you need to access a type in this assembly from 
// COM, set the ComVisible attribute to true on that type.
[assembly: ComVisible(false)]

// The following GUID is for the ID of the typelib if this project is exposed to COM
[assembly: Guid("e2724a74-9d28-4992-a600-278a195cc6a8")]


// -------------------------------------------------------------
//            Do Not Change the Assembly Version Here! 
//
//        Set the assembly version in RevitAddInVersion.cs
// -------------------------------------------------------------


#if REVIT2015
[assembly: AssemblyVersion("2015." +
                           RevitAddInVersion.MajorVersion + "." +
                           RevitAddInVersion.MinorVersion + ".*")]
#elif REVIT2016

[assembly: AssemblyVersion("2016." +
                           RevitAddInVersion.MajorVersion + "." +
                           RevitAddInVersion.MinorVersion + ".*")]
#elif REVIT2017

[assembly: AssemblyVersion("2017." +
                           RevitAddInVersion.MajorVersion + "." +
                           RevitAddInVersion.MinorVersion + ".*")]
#elif REVIT2018

[assembly: AssemblyVersion("2018." +
                           RevitAddInVersion.MajorVersion + "." +
                           RevitAddInVersion.MinorVersion + ".*")]
#elif REVIT2019

[assembly: AssemblyVersion("2019." +
                           RevitAddInVersion.MajorVersion + "." +
                           RevitAddInVersion.MinorVersion + ".*")]
#endif