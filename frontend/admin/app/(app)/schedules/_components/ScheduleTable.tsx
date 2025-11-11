"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Pagination, Spinner, Chip,
} from "@heroui/react";
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, ChevronDownIcon } from "lucide-react";
import { Schedule } from "@/types/schedule";
import { AddScheduleModal } from "./AddScheduleModal";
import { useSchedules } from "@/hooks/useSchedules";

type SortDescriptor = {
  column: string;
  direction: "ascending" | "descending";
};

const columns = [
  { name: "USER ID", uid: "userId", sortable: true },
  { name: "MEAL TYPE", uid: "mealType", sortable: true },
  { name: "PREFERRED TIME", uid: "preferredTime", sortable: true },
  { name: "DAYS OF WEEK", uid: "dayOfWeek", sortable: false },
  { name: "STATUS", uid: "isActive", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["userId", "mealType", "preferredTime", "dayOfWeek", "isActive", "actions"];

export function ScheduleTable() {
  const { schedules, loading, error, fetchSchedules, createSchedule, updateSchedule, deleteSchedule } = useSchedules();

  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "userId",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredSchedules = [...schedules];
    if (hasSearchFilter) {
      filteredSchedules = filteredSchedules.filter((schedule) =>
        schedule.userId.toLowerCase().includes(filterValue.toLowerCase()) ||
        schedule.mealType.toLowerCase().includes(filterValue.toLowerCase()) ||
        schedule.preferredTime.toLowerCase().includes(filterValue.toLowerCase()) ||
        schedule.dayOfWeek.some(day => 
          day.toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }
    return filteredSchedules;
  }, [schedules, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Schedule, b: Schedule) => {
      const first = a[sortDescriptor.column as keyof Schedule] as any;
      const second = b[sortDescriptor.column as keyof Schedule] as any;
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

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleSaveSchedule = async (scheduleData: Partial<Schedule>) => {
    if (editingSchedule) {
      await updateSchedule(editingSchedule._id, scheduleData);
    } else {
      await createSchedule(scheduleData);
    }
    fetchSchedules(); // Refresh data
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      await deleteSchedule(id);
      fetchSchedules(); // Refresh data
    }
  };

  const renderCell = useCallback((schedule: Schedule, columnKey: React.Key) => {
    const cellValue = schedule[columnKey as keyof Schedule];

    switch (columnKey) {
      case "mealType":
        return (
          <Chip className="capitalize" color="primary" size="sm" variant="flat">
            {schedule.mealType}
          </Chip>
        );
      case "preferredTime":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{schedule.preferredTime}</p>
          </div>
        );
      case "dayOfWeek":
        return (
          <div className="flex flex-wrap gap-1">
            {schedule.dayOfWeek.map((day) => (
              <Chip key={day} size="sm" color="secondary" variant="flat">
                {day}
              </Chip>
            ))}
          </div>
        );
      case "isActive":
        return (
          <Chip className="capitalize" color={schedule.isActive ? "success" : "danger"} size="sm" variant="flat">
            {schedule.isActive ? "Active" : "Inactive"}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Button isIconOnly size="sm" variant="light" onPress={() => handleEditSchedule(schedule)}>
              <EditIcon className="text-lg text-default-400" />
            </Button>
            <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeleteSchedule(schedule._id)}>
              <TrashIcon className="text-lg text-danger-500" />
            </Button>
          </div>
        );
      default:
        return cellValue as React.ReactNode;
    }
  }, [handleEditSchedule, handleDeleteSchedule]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by user ID, meal type, or time..."
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
            <Button color="primary" endContent={<PlusIcon />} onPress={handleAddSchedule}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {schedules.length} schedules</span>
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
        aria-label="Schedules table"
        isHeaderSticky
        bottomContent={
          <div className="py-2 px-2 flex justify-between items-center">
            <span className="text-small text-default-400">
              {`Showing ${items.length} of ${filteredItems.length} schedules`}
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
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent={<Spinner label="Loading schedules..." />}
          emptyContent={!loading && !error ? "No schedules found" : "Error loading schedules"}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
        editingSchedule={editingSchedule}
      />
    </div>
  );
}
