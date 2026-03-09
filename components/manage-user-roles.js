"use client";

import { useEffect, useMemo, useState } from "react";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "advocate", label: "Advocate" },
];

const normalizeRole = (role) => (role === "admin" ? "admin" : "advocate");

const ManageUserRoles = () => {
  const [users, setUsers] = useState([]);
  const [draftRoles, setDraftRoles] = useState({});
  const [meta, setMeta] = useState({
    totalClerkUsers: 0,
    includedSupabaseUsers: 0,
    excludedWithoutSupabase: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownFor, setOpenDropdownFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user-roles", { cache: "no-store" });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "Failed to load users.");
      }

      const loadedUsers = (json?.users || []).map((user) => ({
        ...user,
        role: normalizeRole(user.role),
      }));

      setMeta({
        totalClerkUsers: json?.meta?.totalClerkUsers || 0,
        includedSupabaseUsers: json?.meta?.includedSupabaseUsers || loadedUsers.length,
        excludedWithoutSupabase: json?.meta?.excludedWithoutSupabase || 0,
      });

      const initialDrafts = loadedUsers.reduce((acc, user) => {
        acc[user.id] = user.role;
        return acc;
      }, {});

      setUsers(loadedUsers);
      setDraftRoles(initialDrafts);
    } catch (err) {
      console.error("Error loading user roles:", err);
      setError(err?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changedUsers = useMemo(() => {
    return users
      .filter(
        (user) =>
          normalizeRole(draftRoles[user.id]) !== normalizeRole(user.role),
      )
      .map((user) => ({
        userId: user.id,
        fullName: user.fullName,
        fromRole: normalizeRole(user.role),
        toRole: normalizeRole(draftRoles[user.id]),
      }));
  }, [users, draftRoles]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      const first = (user.firstName || "").toLowerCase();
      const last = (user.lastName || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const fullName = (user.fullName || "").toLowerCase();

      return (
        first.includes(term) ||
        last.includes(term) ||
        fullName.includes(term) ||
        email.includes(term)
      );
    });
  }, [users, searchTerm]);

  const hasUnsavedChanges = changedUsers.length > 0;

  const handleRoleChange = (userId, newRole) => {
    setDraftRoles((prev) => ({
      ...prev,
      [userId]: normalizeRole(newRole),
    }));
    setError(null);
    setSuccess(null);
    setOpenDropdownFor(null);
  };

  const handleCancel = () => {
    const reset = users.reduce((acc, user) => {
      acc[user.id] = normalizeRole(user.role);
      return acc;
    }, {});

    setDraftRoles(reset);
    setError(null);
    setSuccess("Unsaved changes were discarded.");
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      setSuccess("No role changes to save.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        updates: changedUsers.map((item) => ({
          userId: item.userId,
          role: item.toRole,
        })),
      };

      const response = await fetch("/api/user-roles", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok && response.status !== 207) {
        throw new Error(json?.error || "Failed to update roles.");
      }

      if (response.status === 207) {
        const failed = (json?.results || []).filter(
          (item) => !item.success,
        ).length;
        setSuccess(
          `Updated ${changedUsers.length - failed} role(s). ${failed} update(s) failed.`,
        );
      } else {
        setSuccess(json?.message || "Roles updated successfully.");
      }

      await fetchUsers();
    } catch (err) {
      console.error("Error saving user roles:", err);
      setError(err?.message || "Failed to save role changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading users…</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {meta.excludedWithoutSupabase > 0 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded">
          {meta.excludedWithoutSupabase} Clerk user(s) are hidden because they are not linked to a Supabase advocate profile.
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="w-full lg:max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by first name, last name, or email"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving || !hasUnsavedChanges}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const currentRole = normalizeRole(user.role);
          const draftRole = normalizeRole(draftRoles[user.id]);
          const changed = currentRole !== draftRole;
          const currentLabel = ROLE_OPTIONS.find(
            (opt) => opt.value === draftRole,
          )?.label;

          return (
            <div
              key={user.id}
              className="border border-gray-300 rounded-3xl px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-1 md:gap-4 items-center">
                <p className="text-lg font-semibold text-gray-800 truncate">
                  {user.fullName || "-"}
                </p>
                <p className="text-base font-semibold text-gray-600 truncate">
                  {user.email || "-"}
                </p>
              </div>

              <div className="relative flex items-center gap-3 shrink-0">
                {changed && (
                  <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                    Unsaved
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdownFor((prev) =>
                      prev === user.id ? null : user.id,
                    )
                  }
                  className="min-w-36 border border-gray-300 rounded-2xl px-4 py-2.5 bg-white text-gray-700 font-semibold flex items-center justify-between gap-2"
                >
                  <span>{currentLabel}</span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {openDropdownFor === user.id && (
                  <div className="absolute right-0 top-12 z-10 bg-white border border-gray-300 rounded-2xl shadow-sm w-36 overflow-hidden">
                    {ROLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleRoleChange(user.id, option.value)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold ${
                          draftRole === option.value
                            ? "bg-gray-100 text-gray-800"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="border border-gray-300 rounded-2xl px-4 py-6 text-center text-gray-600">
            No users match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUserRoles;
