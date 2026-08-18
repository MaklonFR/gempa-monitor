"use strict";

/**
 * Test logika data GEMPA MONITOR (tanpa browser).
 * Jalankan: node scripts/test.js
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Muat data.js dalam konteks VM (karena menggunakan window)
const dataSrc = fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);

const D = sandbox.window.GempaData;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

console.log("=== TEST GEMPA MONITOR ===\n");

// 1. JSON berhasil dibaca
console.log("1. Data JSON");
const rawList = D.extractEarthquakes(D.LOCAL_DATA);
assert(Array.isArray(rawList) && rawList.length === 15, `JSON dibaca, ${rawList.length} record`);

const list = D.normalizeEarthquakes(rawList);
assert(list.length === 15, `Normalisasi: ${list.length} gempa valid`);

// 2. Gempa terbaru benar
console.log("\n2. Gempa terbaru");
const latest = D.getLatestEarthquake(list);
assert(latest && latest.dateTime === "2026-08-17T10:42:42+00:00", `Terbaru: ${latest?.dateTime}`);
assert(latest && latest.magnitude === 5.0, `Magnitude terbaru: ${latest?.magnitude}`);

// 3. Magnitude terbesar benar
console.log("\n3. Magnitude terbesar");
const largest = D.getLargestMagnitude(list);
assert(largest && largest.magnitude === 6.4, `Terbesar: M ${largest?.magnitude}`);
assert(largest && largest.wilayah.includes("SIMALUNGUN"), `Wilayah: ${largest?.wilayah}`);

// 4. Kedalaman terdangkal
console.log("\n4. Kedalaman terdangkal");
const shallowest = D.getShallowestEarthquake(list);
assert(shallowest && shallowest.depth === 10, `Terdangkal: ${shallowest?.depth} km`);

// 5. Statistik
console.log("\n5. Statistik");
const stats = D.getMagnitudeStats(list);
assert(stats.total === 15, `Total: ${stats.total}`);
assert(stats.m5Plus === 15, `M5+: ${stats.m5Plus}`);
assert(stats.largestMagnitude === 6.4, `Terbesar: ${stats.largestMagnitude}`);
assert(stats.shallowestDepth === 10, `Terdangkal: ${stats.shallowestDepth} km`);

// 6. Filter magnitude
console.log("\n6. Filter magnitude");
const gte5 = D.filterEarthquakes(list, { magnitude: "gte5" });
assert(gte5.length === 15, `M5+: ${gte5.length}`);
const gte6 = D.filterEarthquakes(list, { magnitude: "gte6" });
assert(gte6.length === 2, `M6+: ${gte6.length}`);
const lt5 = D.filterEarthquakes(list, { magnitude: "lt5" });
assert(lt5.length === 0, `M<5: ${lt5.length}`);

// 7. Filter tsunami
console.log("\n7. Filter tsunami");
const berpotensi = D.filterEarthquakes(list, { tsunami: "berpotensi" });
assert(berpotensi.length === 0, `Berpotensi: ${berpotensi.length}`);
const tidak = D.filterEarthquakes(list, { tsunami: "tidak" });
assert(tidak.length === 15, `Tidak: ${tidak.length}`);

// 8. Search
console.log("\n8. Search wilayah");
const searchRuteng = D.filterEarthquakes(list, { search: "RUTENG" });
assert(searchRuteng.length === 9, `RUTENG: ${searchRuteng.length}`);
const searchMbay = D.filterEarthquakes(list, { search: "mbay" });
assert(searchMbay.length === 4, `mbay (case-insensitive): ${searchMbay.length}`);

// 9. Filter tanggal
console.log("\n9. Filter tanggal");
const tgl17 = D.filterEarthquakes(list, { tanggal: "17 Agu 2026" });
assert(tgl17.length === 6, `17 Agu: ${tgl17.length}`);

// 10. Sorting
console.log("\n10. Sorting");
const latestSort = D.sortEarthquakes(list, "latest");
assert(latestSort[0].dateTime === "2026-08-17T10:42:42+00:00", `Terbaru: ${latestSort[0].dateTime}`);
const oldestSort = D.sortEarthquakes(list, "oldest");
assert(oldestSort[0].dateTime === "2026-08-15T07:39:41+00:00", `Terlama: ${oldestSort[0].dateTime}`);
const largestSort = D.sortEarthquakes(list, "largest");
assert(largestSort[0].magnitude === 6.4, `Terbesar: ${largestSort[0].magnitude}`);
const smallestSort = D.sortEarthquakes(list, "smallest");
assert(smallestSort[0].magnitude === 5.0, `Terkecil: ${smallestSort[0].magnitude}`);
const shallowSort = D.sortEarthquakes(list, "shallowest");
assert(shallowSort[0].depth === 10, `Terdangkal: ${shallowSort[0].depth}`);
const deepSort = D.sortEarthquakes(list, "deepest");
assert(deepSort[0].depth === 163, `Terdalam: ${deepSort[0].depth}`);

// 11. Koordinat negatif
console.log("\n11. Koordinat negatif");
const coords = D.parseCoordinates("-7.85,120.47");
assert(coords && coords.lat === -7.85 && coords.lon === 120.47, `Parse: ${JSON.stringify(coords)}`);
const invalidCoords = D.parseCoordinates("invalid");
assert(invalidCoords === null, "Koordinat invalid → null");

// 12. Magnitude class/color
console.log("\n12. Magnitude class");
assert(D.getMagnitudeClass(2.5) === "green", "2.5 → green");
assert(D.getMagnitudeClass(3.5) === "blue", "3.5 → blue");
assert(D.getMagnitudeClass(5.5) === "yellow", "5.5 → yellow");
assert(D.getMagnitudeClass(6.5) === "orange", "6.5 → orange");
assert(D.getMagnitudeClass(7.5) === "red", "7.5 → red");
assert(D.getMagnitudeColor(5.5) === "#eab308", "Color 5.5 → #eab308");

// 13. Escape HTML
console.log("\n13. Escape HTML");
const escaped = D.escapeHtml('<script>alert("x")</script>');
assert(!escaped.includes("<script>"), "Tag script di-escape");
const LT_ENTITY = "&" + "lt;";
const LT_MSG = "Mengandung " + LT_ENTITY;
assert(escaped.includes(LT_ENTITY), LT_MSG);

// 14. Fallback
console.log("\n14. Fallback");
assert(D.fallback(null) === "-", "null → -");
assert(D.fallback(undefined) === "-", "undefined → -");
assert(D.fallback("") === "-", "empty → -");
assert(D.fallback("x") === "x", "x → x");

// 15. Format waktu
console.log("\n15. Format waktu");
const clock = D.formatClockWIB(new Date("2026-08-17T10:42:42+00:00"));
assert(/^\d{2}:\d{2}:\d{2}$/.test(clock), `Clock: ${clock}`);

// 16. Robustness: record tidak lengkap
console.log("\n16. Robustness");
const broken = D.normalizeEarthquakes([
  { Tanggal: "17 Agu 2026" },
  null,
  undefined,
  {},
  { Magnitude: "5.0", Wilayah: "Test" },
]);
assert(broken.length >= 1, `Record rusak tidak crash: ${broken.length} valid`);
const brokenEq = broken[0];
assert(brokenEq && brokenEq.magnitude === 5.0, "Magnitude tetap terbaca");
assert(brokenEq && brokenEq.kedalaman === "10 km", "Kedalaman fallback 10 km");

console.log(`\n=== HASIL: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);