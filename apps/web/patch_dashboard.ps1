$file = Join-Path $PSScriptRoot 'app\[locale]\dashboard\page.tsx'
$content = [System.IO.File]::ReadAllText($file)
$content = $content.Replace("`r`n", "`n")

# Fix 1: Add max-h and flex flex-col to the modal container
$old1 = 'className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"'
$new1 = 'className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"'

# Fix 2: Make the content section scrollable
$old2 = '<div className="p-8 space-y-6">'
$new2 = '<div className="p-8 space-y-6 overflow-y-auto flex-1">'

$matched1 = $content.Contains($old1)
$matched2 = $content.Contains($old2)
Write-Host "Match1: $matched1, Match2: $matched2"

if ($matched1) { $content = $content.Replace($old1, $new1); Write-Host "Fixed modal container" }
if ($matched2) { $content = $content.Replace($old2, $new2); Write-Host "Fixed content scroll" }

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done"
