"use client";

import { useEffect, useMemo, useState } from "react";
import ContainerCard from "../components/ContainerCard";
import ModalAdd from "../components/ModalAdd";
import { ContainerWithDetails } from "./types";

function buildContainerTree(
  containers: ContainerWithDetails[]
): ContainerWithDetails[] {
  const containerMap = new Map<string, ContainerWithDetails>();
  const roots: ContainerWithDetails[] = [];

  containers.forEach((container) => {
    container.children = [];
    containerMap.set(container.id, container);
  });

  containers.forEach((container) => {
    if (container.parentId) {
      const parent = containerMap.get(container.parentId);
      parent?.children?.push(container);
    } else {
      roots.push(container);
    }
  });

  return roots;
}

type StoragePayload = {
  locations: {
    id: string;
    name: string;
    containers: ContainerWithDetails[];
  }[];
  allContainers: { id: string; name: string; locationId: string | null }[];
  allLocations: { id: string; name: string }[];
};

export default function HomePage() {
  const [data, setData] = useState<StoragePayload | null>(null);
  const [openByLocation, setOpenByLocation] = useState<Record<string, boolean>>(
    {}
  );

  // ModalAdd state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"item" | "container">("item");
  const [modalLocationId, setModalLocationId] = useState<string | null>(null);
  const [modalContainerId, setModalContainerId] = useState<string | null>(null);

  // Global FAB menu state
  const [fabOpen, setFabOpen] = useState(false);

  // Add Location lightweight modal state
  const [addLocOpen, setAddLocOpen] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [creatingLoc, setCreatingLoc] = useState(false);

  async function loadStorage() {
    const res = await fetch("/api/storage");
    const payload: StoragePayload = await res.json();
    setData(payload);
    const init: Record<string, boolean> = {};
    payload.locations.forEach((loc) => {
      const itemCount = loc.containers.reduce(
        (sum, c) => sum + c.items.length,
        0
      );
      init[loc.id] = itemCount > 0;
    });
    setOpenByLocation(init);
  }

  useEffect(() => {
    let mounted = true;
    loadStorage().catch(() => {
      if (!mounted) return;
      setData({ locations: [], allContainers: [], allLocations: [] });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const isLoading = data === null;

  // Totals (keep hooks before early returns)
  const totals = useMemo(() => {
    if (!data) return { totalItems: 0, totalContainers: 0 };
    let totalItems = 0;
    let totalContainers = 0;
    data.locations.forEach((loc) => {
      totalContainers += loc.containers.length;
      totalItems += loc.containers.reduce((sum, c) => sum + c.items.length, 0);
    });
    return { totalItems, totalContainers };
  }, [data]);

  async function handleCreateLocation() {
    if (!newLocName.trim()) {
      alert("Location name is required");
      return;
    }
    setCreatingLoc(true);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLocName.trim() }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to create location");
      }
      setAddLocOpen(false);
      setNewLocName("");
      await loadStorage();
      alert("Location created!");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create location");
    } finally {
      setCreatingLoc(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full px-2 sm:px-1 lg:px-3 max-w-screen-3xl">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-1">
          <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
          <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
            <div className="h-20 rounded bg-gray-100 animate-pulse" />
            <div className="h-20 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="mt-1 space-y-1">
            <div className="h-6 rounded bg-gray-100 animate-pulse" />
            <div className="h-6 rounded bg-gray-100 animate-pulse" />
            <div className="h-6 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  // Concrete payload (possibly empty)
  const { locations, allContainers, allLocations } = data!;

  return (
    <main className="mx-auto w-full px-2 sm:px-1 lg:px-3 max-w-screen-3xl">
      <header className="mb-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            All Storage Locations
          </h1>
          <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
            {totals.totalContainers} containers
          </span>
          <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
            {totals.totalItems} items
          </span>
        </div>
        <div className="mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
      </header>

      {/* Removed standalone "Add Item" / "Add Container" sections per request */}

      <section className="space-y-1">
        {locations.map((location) => {
          const tree = buildContainerTree(location.containers);
          const itemCount = location.containers.reduce(
            (sum, c) => sum + c.items.length,
            0
          );
          const containerCount = location.containers.length;
          const isOpen = !!openByLocation[location.id];

          return (
            <div
              key={location.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                className="flex items-center justify-between p-1 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setOpenByLocation((prev) => ({
                    ...prev,
                    [location.id]: !prev[location.id],
                  }))
                }
                role="button"
                aria-expanded={isOpen}
                aria-controls={`loc-body-${location.id}`}
              >
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <button
                    type="button"
                    className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenByLocation((prev) => ({
                        ...prev,
                        [location.id]: !prev[location.id],
                      }));
                    }}
                    aria-label={
                      isOpen ? "Collapse location" : "Expand location"
                    }
                  >
                    <span
                      className={`inline-block transition-transform duration-200 ${
                        isOpen ? "rotate-90" : "rotate-180"
                      }`}
                    >
                      ▶
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                        {location.name}
                      </h2>
                      <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
                        {containerCount} containers
                      </span>
                      <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                        {itemCount} items
                      </span>
                    </div>
                    <div className="mt-1 h-0.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
                  </div>
                </div>

                {/* Per-location Add FAB (kept) */}
                <div className="ml-2 shrink-0">
                  <button
                    type="button"
                    aria-label={`Add in ${location.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalType("item"); // default; can switch in ModalAdd
                      setModalLocationId(location.id);
                      setModalContainerId(null);
                      setModalOpen(true);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition active:scale-95 hover:bg-blue-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                id={`loc-body-${location.id}`}
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-none opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-1 pb-1">
                  {tree.length > 0 ? (
                    <div className="space-y-1">
                      {tree.map((container) => (
                        <ContainerCard
                          key={container.id}
                          container={container}
                          allContainers={allContainers}
                          allLocations={allLocations}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-500">
                      No containers yet for this location.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Global floating FAB */}
      <div className="fixed bottom-4 right-4 z-[1100]">
        {/* Plus button */}
        <button
          type="button"
          aria-label="Global add"
          onClick={() => setFabOpen((o) => !o)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-transform ${
              fabOpen ? "rotate-45" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        {/* Menu */}
        {fabOpen && (
          <div
            className="mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-xl"
            role="menu"
          >
            <div className="h-px bg-gray-100" />
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                setFabOpen(false);
                setAddLocOpen(true);
              }}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                +
              </span>
              Add Location
            </button>
          </div>
        )}
      </div>

      {/* Click-away for FAB menu */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-[1000]"
          onClick={() => setFabOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Global Add Modal */}
      <ModalAdd
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedType={modalType}
        selectedLocationId={modalLocationId}
        selectedContainerId={modalContainerId}
        locations={allLocations}
        containers={allContainers}
      />

      {/* Add Location lightweight modal */}
      {addLocOpen && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-2"
          role="dialog"
          aria-modal="true"
          aria-label="Add location"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAddLocOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Add Location
              </h2>
              <button
                type="button"
                onClick={() => setAddLocOpen(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-2 space-y-2">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">
                  Location Name
                </label>
                <input
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., RV, Condo Closet, Storage Unit"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddLocOpen(false)}
                  className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateLocation}
                  disabled={creatingLoc || !newLocName.trim()}
                  className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creatingLoc ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
