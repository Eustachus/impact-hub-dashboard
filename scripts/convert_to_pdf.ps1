param(
    [Parameter(Mandatory=$true)][string]$InputFile,
    [Parameter(Mandatory=$true)][string]$OutputFile
)

$ext = [System.IO.Path]::GetExtension($InputFile).ToLower()

if ($ext -match '\.docx?$') {
    $Word = New-Object -ComObject Word.Application
    # Hide application
    $Word.Visible = $false
    $Word.DisplayAlerts = 'wdAlertsNone'
    
    try {
        $Doc = $Word.Documents.Open($InputFile, $false, $true)
        $Doc.SaveAs([ref] $OutputFile, [ref] 17)
        $Doc.Close([ref] 0)
    } catch {
        Write-Error $_.Exception.Message
    } finally {
        $Word.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($Word) | Out-Null
    }
} elseif ($ext -match '\.xlsx?$') {
    $Excel = New-Object -ComObject Excel.Application
    $Excel.Visible = $false
    $Excel.DisplayAlerts = $false

    try {
        $Workbook = $Excel.Workbooks.Open($InputFile)
        $Workbook.ExportAsFixedFormat(0, $OutputFile)
        $Workbook.Close($false)
    } catch {
        Write-Error $_.Exception.Message
    } finally {
        $Excel.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($Excel) | Out-Null
    }
} else {
    Write-Error "Unsupported file format: $ext"
}
