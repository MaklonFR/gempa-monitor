/* ============================================================
   GEMPA MONITOR — MODUL PETA
   ============================================================
   Bagian:  MAP
   ------------------------------------------------------------
   Modul ini berisi:
   - Inisialisasi peta Leaflet (Indonesia).
   - Marker berwarna berdasarkan magnitude.
   - Popup berisi info gempa.
   - Update marker tanpa membuat duplikat (hapus layer lama).
   ============================================================ */

"use strict";

window.GempaMap = (() => {
  const D = window.GempaData;

  let map = null;
  let layerGroup = null;
  let initialized = false;

  /* ----------------------------------------------------------
     INISIALISASI
     ---------------------------------------------------------- */

  function init(containerId) {
    if (initialized) return;
    if (typeof L === "undefined") {
      console.warn("Leaflet tidak dimuat. Peta dilewati.");
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    map = L.map(containerId, {
      center: [-2.5, 118],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    layerGroup = L.layerGroup().addTo(map);
    initialized = true;

    // Fix ukuran peta saat container terlihat (mobile)
    setTimeout(() => map.invalidateSize(), 200);
  }

  /* ----------------------------------------------------------
     MARKER
     ---------------------------------------------------------- */

  function createIcon(color, magnitude) {
    const size = magnitude >= 7 ? 18 : magnitude >= 6 ? 15 : 12;
    return L.divIcon({
      className: "gempa-marker",
      html: `
        <div class="gempa-marker-pin" style="
          width:${size}px;
          height:${size}px;
          background:${color};
          border:2px solid rgba(255,255,255,0.9);
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 6px rgba(0,0,0,0.4);
        "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  }

  function popupContent(eq) {
    const color = D.getMagnitudeColor(eq.magnitude);
    return `
      <div class="gempa-popup" style="min-width:180px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="
            display:inline-flex;align-items:center;justify-content:center;
            min-width:36px;height:36px;border-radius:8px;
            background:${color}22;color:${color};
            font-weight:800;font-size:14px;
          ">${eq.magnitude.toFixed(1)}</span>
          <div>
            <div style="font-weight:700;font-size:13px;line-height:1.3;">${eq.wilayah}</div>
            <div style="font-size:11px;color:#64748b;">${D.escapeHtml(eq.tanggal)} • ${D.escapeHtml(eq.jam)}</div>
          </div>
        </div>
        <div style="font-size:11px;color:#475569;">
          Kedalaman: ${D.escapeHtml(eq.kedalaman)}<br>
          Koordinat: ${eq.lat !== null ? eq.lat.toFixed(2) : "-"}, ${eq.lon !== null ? eq.lon.toFixed(2) : "-"}
        </div>
      </div>`;
  }

  /**
   * Render semua marker dari daftar gempa.
   * Menghapus layer lama dulu agar tidak ada duplikat (#27).
   */
  function renderMarkers(earthquakes) {
    if (!map || !layerGroup) return;

    // Hapus semua marker lama
    layerGroup.clearLayers();

    const list = D.getEarthquakes(earthquakes);
    const valid = list.filter((eq) => eq.lat !== null && eq.lon !== null);

    valid.forEach((eq) => {
      const color = D.getMagnitudeColor(eq.magnitude);
      const marker = L.marker([eq.lat, eq.lon], {
        icon: createIcon(color, eq.magnitude),
        title: `M ${eq.magnitude.toFixed(1)} - ${eq.wilayah}`,
      });
      marker.bindPopup(popupContent(eq));
      marker.addTo(layerGroup);
    });

    // Fit bounds jika ada marker
    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map((eq) => [eq.lat, eq.lon]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 7 });
    }
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    init,
    renderMarkers,
  };
})();