const matchesStatus = (clientStatus, statusFilter) => {
  if (statusFilter === "active") return clientStatus === "Active";
  if (statusFilter === "inactive") return clientStatus === "Inactive";
  if (statusFilter === "ciwg") {
    return clientStatus === "Critical Incident Working Group";
  }
  return true;
};

const filterByNameAndStatus = (items, searchQuery, statusFilter, getClient) => {
  const term = (searchQuery || "").trim().toLowerCase();

  return items.filter((item) => {
    const client = getClient(item) || {};
    const fullName = `${client.firstName || ""} ${client.lastName || ""}`
      .toLowerCase()
      .trim();
    const matchesSearch = !term || fullName.includes(term);
    const statusMatches = matchesStatus(client.clientStatus, statusFilter);
    return matchesSearch && statusMatches;
  });
};

const parseTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const sortByOption = (items, sortOption, getName, getTime) => {
  const sorted = [...items];

  if (sortOption === "newest") {
    sorted.sort((a, b) => {
      const aDate = getTime(a);
      const bDate = getTime(b);
      if (aDate === null && bDate === null) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
      return bDate - aDate;
    });
  } else if (sortOption === "oldest") {
    sorted.sort((a, b) => {
      const aDate = getTime(a);
      const bDate = getTime(b);
      if (aDate === null && bDate === null) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
      return aDate - bDate;
    });
  } else if (sortOption === "az") {
    sorted.sort((a, b) => getName(a).localeCompare(getName(b)));
  } else if (sortOption === "za") {
    sorted.sort((a, b) => getName(b).localeCompare(getName(a)));
  }

  return sorted;
};

export const getFilteredAndSortedClients = (
  clients,
  searchQuery,
  statusFilter,
  sortOption,
) => {
  const filtered = filterByNameAndStatus(
    clients,
    searchQuery,
    statusFilter,
    (client) => client,
  );

  return sortByOption(
    filtered,
    sortOption,
    (client) =>
      `${client.firstName ?? ""} ${client.lastName ?? ""}`.toLowerCase().trim(),
    (client) => parseTime(client?.createdAt),
  );
};

export const getFilteredAndSortedAssignedClients = (
  assignments,
  searchQuery,
  statusFilter,
  sortOption,
) => {
  const filtered = filterByNameAndStatus(
    assignments,
    searchQuery,
    statusFilter,
    (assignment) => assignment?.Clients,
  );

  return sortByOption(
    filtered,
    sortOption,
    (assignment) =>
      `${assignment?.Clients?.firstName ?? ""} ${assignment?.Clients?.lastName ?? ""}`
        .toLowerCase()
        .trim(),
    (assignment) => parseTime(assignment?.dateAssigned),
  );
};