using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

internal static class RevitAddInVersion
{
    /// <summary>
    /// The major version is incremented when substantial updates or breaking changes are made to the Revit Add-In
    /// </summary>
    /// <remarks>A major version of 0 should be used during initial development</remarks>
    public const string MajorVersion = "0";

    /// <summary>
    /// The minor version is incremented when minor or backwards compatible changes are made to the Revit Add-In
    /// </summary>
    /// <remarks>This value MUST be reset to 0 when the major version increments. Example version sequence: 0.1, 0.2, 1.0, 1.1, 1.2, 1.3, 2.0, 2.1 etc..</remarks>
    public const string MinorVersion = "1";
}