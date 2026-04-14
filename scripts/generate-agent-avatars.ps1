$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot "..\\public\\avatars"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

function New-Color([string]$hex, [int]$alpha = 255) {
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  return [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)
}

function New-PenEx([string]$hex, [float]$width, [int]$alpha = 255) {
  $pen = New-Object System.Drawing.Pen((New-Color $hex $alpha), $width)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $pen
}

function New-BrushEx([string]$hex, [int]$alpha = 255) {
  return New-Object System.Drawing.SolidBrush((New-Color $hex $alpha))
}

function Draw-CommonGlow($graphics, [string]$primary, [string]$secondary, [string]$glow) {
  $graphics.FillEllipse((New-BrushEx $glow 40), 72, 72, 368, 368)
  $graphics.FillEllipse((New-BrushEx $primary 34), 118, 98, 276, 276)
  $graphics.FillEllipse((New-BrushEx $secondary 26), 140, 160, 232, 232)
}

function Draw-Node($graphics, [float]$x, [float]$y, [float]$radius, [string]$hex, [int]$alpha = 255) {
  $brush = New-BrushEx $hex $alpha
  $graphics.FillEllipse($brush, $x - $radius, $y - $radius, $radius * 2, $radius * 2)
  $brush.Dispose()
}

function Save-Agent([string]$name, [string]$primary, [string]$secondary, [string]$glow) {
  $bitmap = New-Object System.Drawing.Bitmap 512, 512
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

  Draw-CommonGlow $graphics $primary $secondary $glow

  switch ($name) {
    "narua" {
      $penPrimary = New-PenEx $primary 18 220
      $penSecondary = New-PenEx $secondary 18 220
      $penAccent = New-PenEx $primary 10 170

      $graphics.DrawLine($penPrimary, 150, 126, 150, 382)
      $graphics.DrawLine($penSecondary, 150, 126, 256, 256)
      $graphics.DrawLine($penPrimary, 256, 256, 362, 126)
      $graphics.DrawLine($penSecondary, 362, 126, 362, 382)
      $graphics.DrawCurve(
        $penAccent,
        @(
          [System.Drawing.Point]::new(150, 382),
          [System.Drawing.Point]::new(220, 330),
          [System.Drawing.Point]::new(290, 300),
          [System.Drawing.Point]::new(362, 382)
        )
      )

      Draw-Node $graphics 150 126 18 $primary 255
      Draw-Node $graphics 150 382 18 $primary 255
      Draw-Node $graphics 256 256 20 $secondary 255
      Draw-Node $graphics 362 126 18 $secondary 255
      Draw-Node $graphics 362 382 18 $secondary 255

      $penPrimary.Dispose()
      $penSecondary.Dispose()
      $penAccent.Dispose()
    }

    "forge" {
      $penPrimary = New-PenEx $primary 12 220
      $penSecondary = New-PenEx $secondary 8 190

      $graphics.DrawRectangle($penPrimary, 128, 128, 256, 256)
      $graphics.DrawRectangle($penSecondary, 176, 176, 160, 160)
      foreach ($line in @(176, 256, 336)) {
        $graphics.DrawLine($penSecondary, 128, $line, 384, $line)
        $graphics.DrawLine($penSecondary, $line, 128, $line, 384)
      }

      Draw-Node $graphics 176 176 12 $primary 255
      Draw-Node $graphics 336 336 12 $secondary 255
      Draw-Node $graphics 256 256 16 $primary 220

      $penPrimary.Dispose()
      $penSecondary.Dispose()
    }

    "atlas" {
      $penPrimary = New-PenEx $primary 10 210
      $penSecondary = New-PenEx $secondary 8 180

      $graphics.DrawEllipse($penPrimary, 118, 118, 276, 276)
      $graphics.DrawEllipse($penSecondary, 162, 162, 188, 188)
      $graphics.DrawArc($penSecondary, 90, 146, 332, 220, 210, 100)
      $graphics.DrawArc($penPrimary, 146, 90, 220, 332, 30, 100)

      Draw-Node $graphics 256 256 18 $primary 250
      Draw-Node $graphics 394 256 12 $secondary 255
      Draw-Node $graphics 150 228 10 $primary 220
      Draw-Node $graphics 286 142 10 $secondary 220

      $penPrimary.Dispose()
      $penSecondary.Dispose()
    }

    "repolink" {
      $penPrimary = New-PenEx $primary 12 210
      $penSecondary = New-PenEx $secondary 10 180
      $points = @(
        @(138, 156),
        @(210, 122),
        @(306, 172),
        @(370, 132),
        @(194, 316),
        @(296, 302),
        @(370, 350)
      )
      $pairs = @(
        @(0, 1), @(1, 2), @(2, 3), @(1, 4), @(2, 5), @(5, 6), @(4, 5)
      )

      foreach ($pair in $pairs) {
        $a = $points[$pair[0]]
        $b = $points[$pair[1]]
        $graphics.DrawLine(
          $(if ($pair[0] % 2 -eq 0) { $penPrimary } else { $penSecondary }),
          $a[0], $a[1], $b[0], $b[1]
        )
      }

      for ($index = 0; $index -lt $points.Length; $index++) {
        $point = $points[$index]
        Draw-Node $graphics $point[0] $point[1] $(if ($index -eq 2) { 18 } else { 12 }) $(if ($index % 2 -eq 0) { $primary } else { $secondary }) 255
      }

      $penPrimary.Dispose()
      $penSecondary.Dispose()
    }

    "nova" {
      $penPrimary = New-PenEx $primary 10 190
      $penSecondary = New-PenEx $secondary 12 190

      $graphics.DrawBezier($penSecondary, 138, 302, 182, 118, 330, 118, 374, 248)
      $graphics.DrawBezier($penPrimary, 150, 332, 210, 162, 332, 210, 362, 356)
      $graphics.DrawArc($penPrimary, 156, 150, 200, 200, 200, 180)
      $graphics.DrawArc($penSecondary, 184, 120, 164, 164, 10, 220)

      Draw-Node $graphics 256 256 20 $primary 240
      Draw-Node $graphics 340 196 12 $secondary 220
      Draw-Node $graphics 184 308 10 $secondary 220

      $penPrimary.Dispose()
      $penSecondary.Dispose()
    }

    "pulse" {
      $penPrimary = New-PenEx $primary 12 210
      $penSecondary = New-PenEx $secondary 8 180

      $graphics.DrawBezier($penPrimary, 110, 278, 166, 278, 176, 176, 236, 176)
      $graphics.DrawBezier($penPrimary, 236, 176, 296, 176, 306, 322, 402, 322)
      $graphics.DrawBezier($penSecondary, 124, 334, 188, 334, 196, 230, 248, 230)
      $graphics.DrawBezier($penSecondary, 248, 230, 302, 230, 318, 286, 386, 286)
      $graphics.DrawArc($penSecondary, 154, 140, 204, 204, 18, 140)

      Draw-Node $graphics 236 176 16 $primary 255
      Draw-Node $graphics 306 322 14 $secondary 255

      $penPrimary.Dispose()
      $penSecondary.Dispose()
    }

    "ops" {
      $penPrimary = New-PenEx $primary 12 210
      $penSecondary = New-PenEx $secondary 8 180

      $graphics.DrawArc($penPrimary, 118, 118, 276, 276, 16, 94)
      $graphics.DrawArc($penPrimary, 118, 118, 276, 276, 136, 94)
      $graphics.DrawArc($penPrimary, 118, 118, 276, 276, 256, 94)
      $graphics.DrawArc($penSecondary, 166, 166, 180, 180, 80, 90)
      $graphics.DrawArc($penSecondary, 166, 166, 180, 180, 210, 90)
      $graphics.DrawLine($penSecondary, 166, 256, 346, 256)

      Draw-Node $graphics 166 256 12 $primary 255
      Draw-Node $graphics 256 166 12 $secondary 255
      Draw-Node $graphics 346 256 12 $primary 255
      Draw-Node $graphics 256 346 12 $secondary 255

      $penPrimary.Dispose()
      $penSecondary.Dispose()
    }
  }

  $bitmap.Save((Join-Path $outputDir ($name + ".png")), [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

Save-Agent "narua" "#35D6FF" "#8B5CF6" "#4F9BFF"
Save-Agent "forge" "#35D6FF" "#7C3AED" "#60A5FA"
Save-Agent "atlas" "#22D3EE" "#8B5CF6" "#A78BFA"
Save-Agent "repolink" "#38BDF8" "#C026D3" "#22D3EE"
Save-Agent "nova" "#A78BFA" "#22D3EE" "#E879F9"
Save-Agent "pulse" "#22D3EE" "#D946EF" "#8B5CF6"
Save-Agent "ops" "#67E8F9" "#A5B4FC" "#E0F2FE"
