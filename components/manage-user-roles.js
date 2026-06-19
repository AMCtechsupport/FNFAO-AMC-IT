"use client";

import { useEffect, useMemo, useState } from "react";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "advocate", label: "Advocate" },
];

const SORT_OPTIONS = [
  { value: "az", label: "Name (A\u2013Z)" },
  { value: "za", label: "Name (Z\u2013A)" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

const applySort = (list, sort) => {
  const sorted = [...list];
  switch (sort) {
    case "za":
      return sorted.sort((a, b) =>
        (b.fullName || "").localeCompare(a.fullName || ""),
      );
    case "newest":
      return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    case "oldest":
      return sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    default:
      return sorted.sort((a, b) =>
        (a.fullName || "").localeCompare(b.fullName || ""),
      );
  }
};

const normalizeRole = (role) => (role === "admin" ? "admin" : "advocate");

const ManageUserRoles = () => {
  const [users, setUsers] = useState([]);
  const [draftRoles, setDraftRoles] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [meta, setMeta] = useState({
    totalUsers: 0,
  });
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [advocateSearchTerm, setAdvocateSearchTerm] = useState("");
  const [adminSort, setAdminSort] = useState("az");
  const [advocateSort, setAdvocateSort] = useState("az");
  const [openFilterFor, setOpenFilterFor] = useState(null);
  const [openDropdownFor, setOpenDropdownFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminSaving, setAdminSaving] = useState(false);
  const [advocateSaving, setAdvocateSaving] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [adminSuccess, setAdminSuccess] = useState(null);
  const [advocateError, setAdvocateError] = useState(null);
  const [advocateSuccess, setAdvocateSuccess] = useState(null);
  const [editingNameFor, setEditingNameFor] = useState(null);
  const [editingNames, setEditingNames] = useState({});
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [nameSuccess, setNameSuccess] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);

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
        totalUsers: json?.meta?.totalUsers || loadedUsers.length,
      });

      const initialDrafts = loadedUsers.reduce((acc, user) => {
        acc[user.id] = user.role;
        return acc;
      }, {});

      setUsers(loadedUsers);
      setDraftRoles(initialDrafts);
      setCurrentUserId(json?.currentUserId || null);
    } catch (err) {
      console.error("Error loading user roles:", err);
      setAdminError(err?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const adminUsers = useMemo(
    () => users.filter((u) => normalizeRole(u.role) === "admin"),
    [users],
  );

  const advocateUsers = useMemo(
    () => users.filter((u) => normalizeRole(u.role) === "advocate"),
    [users],
  );

  const filteredAdmins = useMemo(() => {
    const term = adminSearchTerm.trim().toLowerCase();
    const filtered = term
      ? adminUsers.filter((user) => {
          const fullName = (user.fullName || "").toLowerCase();
          const email = (user.email || "").toLowerCase();
          return fullName.includes(term) || email.includes(term);
        })
      : adminUsers;
    return applySort(filtered, adminSort);
  }, [adminUsers, adminSearchTerm, adminSort]);

  const filteredAdvocates = useMemo(() => {
    const term = advocateSearchTerm.trim().toLowerCase();
    const filtered = term
      ? advocateUsers.filter((user) => {
          const fullName = (user.fullName || "").toLowerCase();
          const email = (user.email || "").toLowerCase();
          return fullName.includes(term) || email.includes(term);
        })
      : advocateUsers;
    return applySort(filtered, advocateSort);
  }, [advocateUsers, advocateSearchTerm, advocateSort]);

  const changedAdmins = useMemo(
    () =>
      adminUsers
        .filter(
          (u) => normalizeRole(draftRoles[u.id]) !== normalizeRole(u.role),
        )
        .map((u) => ({
          userId: u.id,
          toRole: normalizeRole(draftRoles[u.id]),
        })),
    [adminUsers, draftRoles],
  );

  const changedAdvocates = useMemo(
    () =>
      advocateUsers
        .filter(
          (u) => normalizeRole(draftRoles[u.id]) !== normalizeRole(u.role),
        )
        .map((u) => ({
          userId: u.id,
          toRole: normalizeRole(draftRoles[u.id]),
        })),
    [advocateUsers, draftRoles],
  );

  const getEditingUserGroup = (userId) => {
    if (adminUsers.some((u) => u.id === userId)) return "admin";
    if (advocateUsers.some((u) => u.id === userId)) return "advocate";
    return null;
  };

  const handleRoleChange = (userId, newRole) => {
    setDraftRoles((prev) => ({ ...prev, [userId]: normalizeRole(newRole) }));
    setOpenDropdownFor(null);
    setAdminError(null);
    setAdminSuccess(null);
    setAdvocateError(null);
    setAdvocateSuccess(null);
  };

  const handleNameEditStart = (user) => {
    setEditingNameFor(user.id);
    setEditingNames({
      [user.id]: { firstName: user.firstName, lastName: user.lastName },
    });
    setNameError(null);
    setNameSuccess(null);
  };

  const handleNameChange = (userId, firstName, lastName) => {
    setEditingNames((prev) => ({
      ...prev,
      [userId]: { firstName, lastName },
    }));
  };

  const handleNameCancel = () => {
    setEditingNameFor(null);
    setEditingNames({});
    setNameError(null);
    setNameSuccess(null);
  };

  const handleNameSave = async (user) => {
    const edited = editingNames[user.id];
    if (!edited) return;

    setNameSaving(true);
    setNameError(null);
    setNameSuccess(null);

    try {
      const response = await fetch("/api/update-user-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          firstName: edited.firstName,
          lastName: edited.lastName,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "Failed to update name");
      }

      setNameSuccess("Name updated successfully.");
      setEditingNameFor(null);
      setEditingNames({});
      await fetchUsers();
    } catch (err) {
      console.error("Error saving name:", err);
      setNameError(err?.message || "Failed to update name");
    } finally {
      setNameSaving(false);
    }
  };

  const handleCancel = (group) => {
    const groupUsers = group === "admin" ? adminUsers : advocateUsers;
    const reset = groupUsers.reduce((acc, user) => {
      acc[user.id] = normalizeRole(user.role);
      return acc;
    }, {});
    setDraftRoles((prev) => ({ ...prev, ...reset }));
    if (group === "admin") {
      setAdminError(null);
      setAdminSuccess("Unsaved changes were discarded.");
    } else {
      setAdvocateError(null);
      setAdvocateSuccess("Unsaved changes were discarded.");
    }
  };

  const handleSave = async (group) => {
    const changedUsers = group === "admin" ? changedAdmins : changedAdvocates;
    const setSaving = group === "admin" ? setAdminSaving : setAdvocateSaving;
    const setError = group === "admin" ? setAdminError : setAdvocateError;
    const setSuccess = group === "admin" ? setAdminSuccess : setAdvocateSuccess;

    if (changedUsers.length === 0) {
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
        headers: { "Content-Type": "application/json" },
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

  const renderUserRow = (user) => {
    const isSelf = user.id === currentUserId;
    const currentRole = normalizeRole(user.role);
    const draftRole = normalizeRole(draftRoles[user.id]);
    const changed = !isSelf && currentRole !== draftRole;
    const currentLabel = ROLE_OPTIONS.find(
      (opt) => opt.value === draftRole,
    )?.label;
    const isEditingName = editingNameFor === user.id;
    const editedName = editingNames[user.id];

    return (
      <div
        key={user.id}
        className="group border border-gray-300 rounded-2xl px-4 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 items-center"
      >
        <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          {isEditingName && editedName ? (
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:basis-1/2 md:shrink-0">
              <input
                type="text"
                value={editedName.firstName}
                onChange={(e) =>
                  handleNameChange(user.id, e.target.value, editedName.lastName)
                }
                placeholder="First Name"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                disabled={nameSaving}
              />
              <input
                type="text"
                value={editedName.lastName}
                onChange={(e) =>
                  handleNameChange(
                    user.id,
                    editedName.firstName,
                    e.target.value,
                  )
                }
                placeholder="Last Name"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                disabled={nameSaving}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNameSave(user)}
                  disabled={nameSaving}
                  className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNameCancel}
                  disabled={nameSaving}
                  className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Cancel"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative md:basis-1/2 md:shrink-0 md:min-w-0 flex items-center gap-2">
                <p className="text-base font-semibold text-gray-800 truncate">
                  {user.fullName || "-"}
                </p>
                <button
                  type="button"
                  onClick={() => handleNameEditStart(user)}
                  className="p-1 text-gray-500 opacity-10 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  title="Edit name"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              <p className="min-w-0 text-sm font-semibold text-gray-600 truncate">
                {user.email || "-"}
              </p>
            </>
          )}
        </div>

        <div className="relative flex items-center gap-2 shrink-0">
          <span
            className={`min-w-[4.5rem] text-center text-xs font-medium px-2 py-1 rounded-full ${
              isSelf
                ? "text-blue-700 bg-blue-100"
                : `text-amber-700 bg-amber-100 ${changed ? "" : "invisible"}`
            }`}
          >
            {isSelf ? "You" : "Unsaved"}
          </span>

          <button
            type="button"
            disabled={isSelf}
            onClick={() =>
              setOpenDropdownFor((prev) => (prev === user.id ? null : user.id))
            }
            className={`min-w-32 border border-gray-300 rounded-2xl px-3 py-2 bg-white text-gray-700 font-semibold flex items-center justify-between gap-2 text-sm ${
              isSelf ? "opacity-50 cursor-not-allowed" : ""
            }`}
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

          {!isSelf && openDropdownFor === user.id && (
            <div className="absolute right-0 top-12 z-10 bg-white border border-gray-300 rounded-2xl shadow-sm w-36 overflow-hidden">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRoleChange(user.id, option.value)}
                  className={`w-full text-left px-4 py-2 text-sm font-semibold ${
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
  };

  const renderBlock = ({
    title,
    filteredList,
    searchValue,
    onSearchChange,
    sortValue,
    onSortChange,
    changedList,
    group,
    saving,
    error,
    success,
  }) => (
    <div className="space-y-2 mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {filteredList.length}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenFilterFor((prev) => (prev === group ? null : group))
                }
                className="border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-50 text-sm"
                title="Sort order"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 5h14M6 10h8M9 15h2"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-xs">
                  {SORT_OPTIONS.find((o) => o.value === sortValue)?.label}
                </span>
              </button>

              {openFilterFor === group && (
                <div className="absolute left-0 top-12 z-10 bg-white border border-gray-300 rounded-2xl shadow-sm w-40 overflow-hidden">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onSortChange(option.value);
                        setOpenFilterFor(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-semibold ${
                        sortValue === option.value
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

            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or email"
              className="w-full sm:w-64 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300/80/80"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(group)}
              disabled={saving || changedList.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => handleCancel(group)}
              disabled={saving || changedList.length === 0}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
          {success}
        </div>
      )}

      {getEditingUserGroup(editingNameFor || "") === group && nameError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {nameError}
        </div>
      )}

      {getEditingUserGroup(editingNameFor || "") === group && nameSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
          {nameSuccess}
        </div>
      )}

      <div className="space-y-2">
        {filteredList.map((user) => renderUserRow(user))}

        {filteredList.length === 0 && (
          <div className="border border-gray-300 rounded-2xl px-4 py-3 text-center text-gray-600 text-sm">
            No users match your search.
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <p className="text-gray-600">Loading users…</p>;
  }

  return (
    <div className="space-y-6">
      {renderBlock({
        title: "Admins",
        filteredList: filteredAdmins,
        searchValue: adminSearchTerm,
        onSearchChange: setAdminSearchTerm,
        sortValue: adminSort,
        onSortChange: setAdminSort,
        changedList: changedAdmins,
        group: "admin",
        saving: adminSaving,
        error: adminError,
        success: adminSuccess,
      })}

      <hr className="border-gray-200" />

      {renderBlock({
        title: "Advocates",
        filteredList: filteredAdvocates,
        searchValue: advocateSearchTerm,
        onSearchChange: setAdvocateSearchTerm,
        sortValue: advocateSort,
        onSortChange: setAdvocateSort,
        changedList: changedAdvocates,
        group: "advocate",
        saving: advocateSaving,
        error: advocateError,
        success: advocateSuccess,
      })}
    </div>
  );
};

export default ManageUserRoles;
