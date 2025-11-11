"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Pagination, Spinner, Chip,
} from "@heroui/react";
import { SearchIcon, ChevronDownIcon } from "lucide-react";
import { AuditLog } from "@/types/audit-log";
import { useAuditLogs } from "@/hooks/useAuditLogs";

type SortDescriptor = {
  column: string;
  direction: "ascending" | "descending";
};

const columns = [
  { name: "TIMESTAMP", uid: "timestamp", sortable: true },
  { name: "USER ID", uid: "userId", sortable: true },
  { name: "ACTION", uid: "action", sortable: true },
  { name: "ENTITY TYPE", uid: "entityType", sortable: true },
  { name: "ENTITY ID", uid: "entityId", sortable: true },
  { name: "DETAILS", uid: "details", sortable: false },
];

const INITIAL_VISIBLE_COLUMNS = ["timestamp", "userId", "action", "entityType", "entityId", "details"];

export function AuditLogsTable() {
  const { auditLogs, loading, error } = useAuditLogs();

  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "timestamp",
    direction: "descending",
  });
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredLogs = [...auditLogs];
    if (hasSearchFilter) {
      filteredLogs = filteredLogs.filter((log) =>
        log.userId.toLowerCase().includes(filterValue.toLowerCase()) ||
        log.action.toLowerCase().includes(filterValue.toLowerCase()) ||
        log.entityType.toLowerCase().includes(filterValue.toLowerCase()) ||
        log.entityId.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredLogs;
  }, [auditLogs, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: AuditLog, b: AuditLog) => {
      const first = a[sortDescriptor.column as keyof AuditLog] as any;
      const second = b[sortDescriptor.column as keyof AuditLog] as any;
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const onRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "success";
    if (action.includes("UPDATE")) return "warning";
    if (action.includes("DELETE")) return "danger";
    return "default";
  };

  const renderCell = useCallback((log: AuditLog, columnKey: React.Key) => {
    const cellValue = log[columnKey as keyof AuditLog];

    switch (columnKey) {
      case "timestamp":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">
              {new Date(log.timestamp).toLocaleDateString()}
            </p>
            <p className="text-bold text-tiny text-default-400">
              {new Date(log.timestamp).toLocaleTimeString()}
            </p>
          </div>
        );
      case "action":
        return (
          <Chip 
            className="capitalize" 
            color={getActionColor(log.action)} 
            size="sm" 
            variant="flat"
          >
            {log.action}
          </Chip>
        );
      case "entityType":
        return (
          <Chip className="capitalize" color="primary" size="sm" variant="flat">
            {log.entityType}
          </Chip>
        );
      case "details":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small line-clamp-2">
              {JSON.stringify(log.details).substring(0, 100)}...
            </p>
          </div>
        );
      default:
        return cellValue as React.ReactNode;
    }
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by user ID, action, or entity..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(keys) => setVisibleColumns(new Set(Array.from(keys, String)))}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {auditLogs.length} audit logs</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>

      <Table
        aria-label="Audit logs table"
        isHeaderSticky
        bottomContent={
          <div className="py-2 px-2 flex justify-between items-center">
            <span className="text-small text-default-400">
              {`Showing ${items.length} of ${filteredItems.length} audit logs`}
            </span>
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={setPage}
            />
          </div>
        }
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align="start"
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent={<Spinner label="Loading audit logs..." />}
          emptyContent={!loading && !error ? "No audit logs found" : "Error loading audit logs"}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
