#!/usr/bin/env node

/**
 * Neroa Stability / Fragmentation Audit
 *
 * Scans the repo for common instability patterns:
 * - duplicated route names
 * - legacy references
 * - inconsistent naming
 * - oversized files
 * - TODO/FIXME/HACK density
 * - duplicate filenames in different folders
 * - conflicting page / route patterns
 * - suspicious import depth
 *
 * Usage:
 *   node tools/stability-audit.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const IGNORE_NAMES = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".vercel",
  "out",
  "reports",
  "test-results",
]);

const CODE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
]);

const ANALYSIS_EXCLUSIONS = new Set(["package-lock.json"]);
const SELF_AUDIT_RELATIVE_PATH = "tools/stability-audit.js";
const CANONICAL_BRAND = "Ne" + "roa";
const DEPRECATED_BRAND = "Na" + "roa";
const canonicalBrandPattern = new RegExp(`\\b${CANONICAL_BRAND}\\b`, "g");
const deprecatedBrandPattern = new RegExp(`\\b${DEPRECATED_BRAND}\\b`, "g");

const findings = [];
const fileStats = [];
const duplicateBaseNames = new Map();
const pageRoutes = [];
const apiRoutes = [];
const namingHits = {
  neroa: [],
  naroa: [],
};
const riskWords = ["TODO", "FIXME", "HACK", "TEMP", "LEGACY", "deprecated"];

function shouldIgnoreEntry(name) {
  if (IGNORE_NAMES.has(name)) return true;
  if (/^\.?tmp($|[-_])/i.test(name)) return true;
  if (/^\.next($|[_-])/i.test(name)) return true;
  return false;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (shouldIgnoreEntry(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!CODE_EXTENSIONS.has(ext)) continue;

    analyzeFile(full);
  }
}

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function addFinding(severity, category, message, file = null) {
  findings.push({
    severity,
    category,
    message,
    file: file ? relative(file) : null,
  });
}

function analyzeFile(file) {
  const rel = relative(file);
  const base = path.basename(file);
  const content = fs.readFileSync(file, "utf8");

  const lines = content.split(/\r?\n/);
  const lineCount = lines.length;

  fileStats.push({ file: rel, lineCount });

  if (ANALYSIS_EXCLUSIONS.has(rel)) {
    return;
  }

  if (!duplicateBaseNames.has(base)) duplicateBaseNames.set(base, []);
  duplicateBaseNames.get(base).push(rel);

  if (rel !== SELF_AUDIT_RELATIVE_PATH) {
    if (canonicalBrandPattern.test(content)) namingHits.neroa.push(rel);
    if (deprecatedBrandPattern.test(content)) namingHits.naroa.push(rel);
  }

  const riskMatches = riskWords.flatMap((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    return [...content.matchAll(regex)].map(() => word);
  });

  if (riskMatches.length >= 3) {
    addFinding(
      "medium",
      "hotspot",
      `High maintenance marker density (${riskMatches.length} markers)`,
      file
    );
  }

  if (lineCount > 500) {
    addFinding(
      "medium",
      "oversized-file",
      `Large file (${lineCount} lines) may be taking on too many responsibilities`,
      file
    );
  }

  if (lineCount > 900) {
    addFinding(
      "high",
      "oversized-file",
      `Very large file (${lineCount} lines) strongly suggests fragmentation risk`,
      file
    );
  }

  const deepRelativeImports = [
    ...content.matchAll(/from\s+['"](\.\.\/\.\.\/\.\.\/[^'"]+)['"]/g),
    ...content.matchAll(/require\(['"](\.\.\/\.\.\/\.\.\/[^'"]+)['"]\)/g),
  ];
  if (deepRelativeImports.length > 0) {
    addFinding(
      "medium",
      "import-depth",
      `Uses very deep relative imports (${deepRelativeImports.length})`,
      file
    );
  }

  if (/legacy|old-|backup|temp-|copy|final-final/i.test(rel)) {
    addFinding(
      "high",
      "legacy-artifact",
      "Filename/path suggests stale or duplicate implementation branch",
      file
    );
  }

  if (/app\/api\/.+\/route\.(ts|js)$/.test(rel)) apiRoutes.push(rel);
  if (
    /app\/.+\/page\.(ts|tsx|js|jsx)$/.test(rel) ||
    /pages\/.+\.(ts|tsx|js|jsx)$/.test(rel)
  ) {
    pageRoutes.push(rel);
  }

  if (/\/auth/i.test(rel) && /\/start/i.test(content)) {
    addFinding(
      "low",
      "auth-flow-coupling",
      "Auth-related file references start/build flow directly; verify intended sequencing",
      file
    );
  }

  if (
    /router\.push|redirect|NextResponse\.redirect/.test(content) &&
    /auth|login|signup/i.test(content)
  ) {
    addFinding(
      "low",
      "redirect-review",
      "Contains routing + auth logic together; confirm route consistency",
      file
    );
  }

  const duplicateExportDefaults = [...content.matchAll(/export\s+default/g)];
  if (duplicateExportDefaults.length > 1) {
    addFinding("high", "export-structure", "Multiple default exports detected", file);
  }
}

function analyzeDuplicates() {
  for (const [base, files] of duplicateBaseNames.entries()) {
    if (files.length > 1) {
      const meaningful = files.filter(
        (f) =>
          !f.includes("/types/") &&
          !f.includes("/__tests__/") &&
          !f.includes("/tests/")
      );
      if (meaningful.length > 1) {
        findings.push({
          severity: "medium",
          category: "duplicate-filename",
          message: `Duplicate filename "${base}" appears in multiple locations`,
          file: meaningful.join(" | "),
        });
      }
    }
  }
}

function analyzeNaming() {
  if (namingHits.naroa.length > 0) {
    findings.push({
      severity: "high",
      category: "branding-inconsistency",
      message: `Found deprecated project-brand references ("${DEPRECATED_BRAND}") in ${namingHits.naroa.length} files`,
      file: namingHits.naroa.slice(0, 20).join(" | "),
    });
  }
}

function analyzeRoutes() {
  const routeMap = new Map();

  function normalizeRoute(file) {
    return file
      .replace(/^app\//, "/")
      .replace(/^pages\//, "/")
      .replace(/\/page\.(ts|tsx|js|jsx)$/, "")
      .replace(/\.(ts|tsx|js|jsx)$/, "")
      .replace(/\/index$/, "/")
      .replace(/\/route$/, "")
      .replace(/\\/g, "/");
  }

  for (const routeFile of pageRoutes) {
    const route = normalizeRoute(routeFile);
    if (!routeMap.has(route)) routeMap.set(route, []);
    routeMap.get(route).push(routeFile);
  }

  for (const [route, files] of routeMap.entries()) {
    if (files.length > 1) {
      findings.push({
        severity: "high",
        category: "route-conflict",
        message: `Multiple page implementations appear to resolve to route "${route}"`,
        file: files.join(" | "),
      });
    }
  }

  const suspiciousPairs = [
    ["/start", "/auth"],
    ["/diy-build", "/managed-build"],
    ["/pricing", "/start"],
  ];

  for (const [a, b] of suspiciousPairs) {
    const aFiles = pageRoutes.filter((f) => normalizeRoute(f).includes(a));
    const bFiles = pageRoutes.filter((f) => normalizeRoute(f).includes(b));
    if (aFiles.length && bFiles.length) {
      findings.push({
        severity: "low",
        category: "flow-review",
        message: `Review interaction between ${a} and ${b} routes for clean sequencing`,
        file: [...aFiles, ...bFiles].slice(0, 10).join(" | "),
      });
    }
  }
}

function summarize() {
  const severityRank = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      filesScanned: fileStats.length,
      findings: findings.length,
      high: findings.filter((f) => f.severity === "high").length,
      medium: findings.filter((f) => f.severity === "medium").length,
      low: findings.filter((f) => f.severity === "low").length,
    },
    topLargestFiles: [...fileStats].sort((a, b) => b.lineCount - a.lineCount).slice(0, 20),
    findings,
  };

  const outDir = path.join(ROOT, "reports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "stability-audit.json");
  const mdPath = path.join(outDir, "stability-audit.md");

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const md = [];
  md.push("# Stability Audit Report");
  md.push("");
  md.push(`Generated: ${report.generatedAt}`);
  md.push("");
  md.push("## Totals");
  md.push("");
  md.push(`- Files scanned: ${report.totals.filesScanned}`);
  md.push(`- Findings: ${report.totals.findings}`);
  md.push(`- High: ${report.totals.high}`);
  md.push(`- Medium: ${report.totals.medium}`);
  md.push(`- Low: ${report.totals.low}`);
  md.push("");
  md.push("## Largest Files");
  md.push("");
  for (const f of report.topLargestFiles) {
    md.push(`- ${f.file} - ${f.lineCount} lines`);
  }
  md.push("");
  md.push("## Findings");
  md.push("");
  for (const f of findings) {
    md.push(`### [${f.severity.toUpperCase()}] ${f.category}`);
    md.push(`${f.message}`);
    if (f.file) md.push(`- File(s): ${f.file}`);
    md.push("");
  }

  fs.writeFileSync(mdPath, md.join("\n"), "utf8");

  console.log("Audit complete.");
  console.log(`JSON: ${jsonPath}`);
  console.log(`MD:   ${mdPath}`);
  console.log("");
  console.log(
    `High: ${report.totals.high} | Medium: ${report.totals.medium} | Low: ${report.totals.low}`
  );

  if (report.totals.high > 0) {
    process.exitCode = 2;
  }
}

function main() {
  walk(ROOT);
  analyzeDuplicates();
  analyzeNaming();
  analyzeRoutes();
  summarize();
}

main();
