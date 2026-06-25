"use client";

import { useEffect, useRef, useState } from "react";
import supabase from "@/app/lib/supabase";

const MANITOBA_SW = [48.99, -102.05];
const MANITOBA_NE = [59.85, -89.15];
const MANITOBA_MIN_ZOOM = 5.5;
const MAX_CLIENTS_IN_POPUP = 20;

function isInManitoba(lat, lng) {
  return lat >= 48.5 && lat <= 61 && lng >= -102.5 && lng <= -88;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clientViewPath(client) {
  if (client.clientType === "Youth Intake") {
    return `/youth-clients/${client.client_id}/view`;
  }
  return `/adult-clients/${client.client_id}/view`;
}

function groupClientsByNation(clients) {
  const grouped = {};
  for (const client of clients || []) {
    const nation = client.firstNationMembership?.trim();
    if (!nation) continue;
    if (!grouped[nation]) grouped[nation] = [];
    grouped[nation].push(client);
  }

  for (const nation of Object.keys(grouped)) {
    grouped[nation].sort((a, b) => {
      const last = (a.lastName || "").localeCompare(b.lastName || "");
      if (last !== 0) return last;
      return (a.firstName || "").localeCompare(b.firstName || "");
    });
  }

  return grouped;
}

function buildPopupHtml(nation, clients) {
  const chief = nation.chiefName?.trim();
  const phone = nation.bandOfficePhone?.trim();
  const visibleClients = clients.slice(0, MAX_CLIENTS_IN_POPUP);
  const remaining = clients.length - visibleClients.length;

  const clientItems = visibleClients.length
    ? visibleClients
        .map((client) => {
          const name = [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed client";
          const href = clientViewPath(client);
          return `<li><a href="${href}" class="fn-map-client-link">${escapeHtml(name)}</a></li>`;
        })
        .join("")
    : '<li class="fn-map-muted">No clients on file</li>';

  const moreLine =
    remaining > 0
      ? `<p class="fn-map-muted">and ${remaining} more client${remaining === 1 ? "" : "s"}</p>`
      : "";

  return `
    <div class="fn-map-popup">
      <h3 class="fn-map-title">${escapeHtml(nation.firstNationMembership)}</h3>
      ${chief ? `<p><span class="fn-map-label">Chief:</span> ${escapeHtml(chief)}</p>` : ""}
      ${phone ? `<p><span class="fn-map-label">Band office:</span> <a href="tel:${escapeHtml(phone.replace(/\s/g, ""))}">${escapeHtml(phone)}</a></p>` : ""}
      <p class="fn-map-label fn-map-clients-heading">Clients (${clients.length})</p>
      <ul class="fn-map-client-list">${clientItems}</ul>
      ${moreLine}
    </div>
  `;
}

function configureLeafletIcons(L) {
  // eslint-disable-next-line no-underscore-dangle
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export default function FirstNationsMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nationCount, setNationCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      setLoading(true);
      setError(null);

      const [nationsResult, clientsResult] = await Promise.all([
        supabase
          .from("First Nations")
          .select("nation_id, firstNationMembership, latitude, longitude, bandOfficePhone, chiefName")
          .order("firstNationMembership", { ascending: true }),
        supabase
          .from("Clients")
          .select("client_id, firstName, lastName, clientType, firstNationMembership")
          .order("lastName", { ascending: true }),
      ]);

      if (cancelled) return;

      if (nationsResult.error || clientsResult.error) {
        setError("Could not load map data. Please try again.");
        setLoading(false);
        return;
      }

      const nations = (nationsResult.data || []).filter((nation) => {
        const lat = Number(nation.latitude);
        const lng = Number(nation.longitude);
        return Number.isFinite(lat) && Number.isFinite(lng) && isInManitoba(lat, lng);
      });
      const clientsByNation = groupClientsByNation(clientsResult.data || []);

      setNationCount(nations.length);
      setClientCount((clientsResult.data || []).filter((c) => c.firstNationMembership).length);

      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapContainerRef.current) return;

      const L = leaflet.default;
      configureLeafletIcons(L);

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: true,
        minZoom: MANITOBA_MIN_ZOOM,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const manitobaBounds = L.latLngBounds(MANITOBA_SW, MANITOBA_NE);
      map.setMaxBounds(manitobaBounds.pad(0.08));
      map.fitBounds(manitobaBounds, { padding: [20, 20] });

      const bounds = [];

      for (const nation of nations) {
        const lat = Number(nation.latitude);
        const lng = Number(nation.longitude);
        const clients = clientsByNation[nation.firstNationMembership] || [];
        const marker = L.marker([lat, lng]).addTo(map);
        const popupHtml = buildPopupHtml(nation, clients);

        marker.bindPopup(popupHtml, {
          maxWidth: 320,
          minWidth: 240,
          autoClose: false,
          closeOnClick: false,
        });

        marker.on("mouseover", function onMarkerOver() {
          this.openPopup();
        });

        marker.on("mouseout", function onMarkerOut() {
          const popupEl = this.getPopup()?.getElement();
          window.setTimeout(() => {
            if (popupEl?.matches(":hover")) return;
            this.closePopup();
          }, 200);
        });

        marker.on("popupopen", (event) => {
          const popupEl = event.popup.getElement();
          if (!popupEl) return;
          popupEl.addEventListener(
            "mouseleave",
            () => {
              event.popup._source?.closePopup();
            },
            { once: true },
          );
        });

        bounds.push([lat, lng]);
        markersRef.current.push(marker);
      }

      if (bounds.length > 0) {
        const markerBounds = L.latLngBounds(bounds);
        map.fitBounds(markerBounds, { padding: [48, 48], maxZoom: 8 });
        if (map.getZoom() < MANITOBA_MIN_ZOOM) {
          map.fitBounds(manitobaBounds, { padding: [20, 20] });
        }
      } else {
        map.fitBounds(manitobaBounds, { padding: [20, 20] });
      }

      window.requestAnimationFrame(() => {
        map.invalidateSize();
      });

      mapRef.current = map;
      setLoading(false);
    }

    loadMap().catch(() => {
      if (!cancelled) {
        setError("Could not load the map.");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manitoba First Nations Map</h1>
          <p className="text-sm text-gray-500 mt-1">
            Hover a community pin to see chief, band office phone, and clients.
          </p>
        </div>
        {!loading && !error && (
          <div className="text-sm text-gray-600">
            {nationCount} communities · {clientCount} clients with a First Nation on file
          </div>
        )}
      </div>

      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-sm text-gray-500">
            Loading map…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 text-sm text-red-600 px-6 text-center">
            {error}
          </div>
        )}
        <div ref={mapContainerRef} className="h-[calc(100vh-220px)] min-h-[520px] w-full z-0" />
      </div>

      <p className="text-xs text-gray-500">
        Client links open the client record. Communities without map coordinates (for example Non-Status or Métis) are not shown.
      </p>

      <style jsx global>{`
        .fn-map-popup {
          font-size: 13px;
          line-height: 1.45;
          color: #374151;
        }
        .fn-map-popup p {
          margin: 0 0 6px;
        }
        .fn-map-title {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 700;
          color: #111827;
        }
        .fn-map-label {
          font-weight: 600;
          color: #4b5563;
        }
        .fn-map-clients-heading {
          margin-top: 10px !important;
        }
        .fn-map-client-list {
          margin: 4px 0 0;
          padding-left: 18px;
          max-height: 180px;
          overflow-y: auto;
        }
        .fn-map-client-list li {
          margin-bottom: 2px;
        }
        .fn-map-client-link {
          color: rgba(97, 0, 215, 0.9);
          text-decoration: none;
          font-weight: 500;
        }
        .fn-map-client-link:hover {
          text-decoration: underline;
        }
        .fn-map-muted {
          color: #6b7280;
          font-style: italic;
        }
        .leaflet-popup-content {
          margin: 12px 14px;
        }
      `}</style>
    </div>
  );
}
