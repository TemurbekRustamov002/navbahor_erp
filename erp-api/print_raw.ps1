param([string]$printerName, [string]$filePath)

try {
    if (-not (Test-Path $filePath)) {
        Write-Host "ERROR: File not found"
        exit 1
    }

    # Read the file content as a byte array (RAW)
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    
    $code = @"
    using System;
    using System.Runtime.InteropServices;
    using System.IO;

    public class RawPrinter {
        [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Ansi)]
        public class DOCINFOA {
            [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
            [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
            [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
        }

        [DllImport("winspool.Drv", EntryPoint="OpenPrinterA", SetLastError=true, CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
        public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);

        [DllImport("winspool.Drv", EntryPoint="ClosePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
        public static extern bool ClosePrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", EntryPoint="StartDocPrinterA", SetLastError=true, CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
        public static extern int StartDocPrinter(IntPtr hPrinter, Int32 level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

        [DllImport("winspool.Drv", EntryPoint="EndDocPrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
        public static extern bool EndDocPrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", EntryPoint="StartPagePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
        public static extern bool StartPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", EntryPoint="EndPagePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
        public static extern bool EndPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", EntryPoint="WritePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
        public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);

        public static bool SendBytesToPrinter(string szPrinterName, byte[] pBytes) {
            IntPtr hPrinter = new IntPtr(0);
            DOCINFOA di = new DOCINFOA();
            Int32 dwWritten = 0;
            bool success = false;

            di.pDocName = "NAVBAHOR_PRINT";
            di.pDataType = "RAW";

            if (OpenPrinter(szPrinterName, out hPrinter, IntPtr.Zero)) {
                if (StartDocPrinter(hPrinter, 1, di) != 0) {
                    if (StartPagePrinter(hPrinter)) {
                        IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(pBytes.Length);
                        Marshal.Copy(pBytes, 0, pUnmanagedBytes, pBytes.Length);
                        success = WritePrinter(hPrinter, pUnmanagedBytes, pBytes.Length, out dwWritten);
                        EndPagePrinter(hPrinter);
                        Marshal.FreeCoTaskMem(pUnmanagedBytes);
                    }
                    EndDocPrinter(hPrinter);
                }
                ClosePrinter(hPrinter);
            }
            return success && (dwWritten == pBytes.Length);
        }
    }
"@
    
    # Avoid re-defining the type if it already exists in the session
    if (-not ([System.Management.Automation.PSTypeName]"RawPrinter").Type) {
        Add-Type -TypeDefinition $code
    }

    $result = [RawPrinter]::SendBytesToPrinter($printerName, $bytes)
    
    if ($result) {
        Write-Host "SUCCESS"
    } else {
        Write-Host "FAILED: Printer $printerName not found or write failed."
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}