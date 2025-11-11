"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Pagination, Spinner, Chip,
} from "@heroui/react";
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, ChevronDownIcon } from "lucide-react";
import { Preference } from "@/types/preference";
import { AddPreferenceModal } from "./AddPreferenceModal";
import { usePreferences } from "@/hooks/usePreferences";

type SortDescriptor = {
  column: string;
  direction: "ascending" | "descending";
};

const columns = [
  { name: "USER ID", uid: "userId", sortable: true },
  { name: "DIETARY RESTRICTIONS", uid: "dietaryRestrictions", sortable: false },
  { name: "ALLERGIES", uid: "allergies", sortable: false },
  { name: "FAVORITE CUISINES", uid: "favoriteCuisines", sortable: false },
  { name: "BUDGET RANGE", uid: "budget", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["userId", "dietaryRestrictions", "allergies", "favoriteCuisines", "budget", "actions"];

export function PreferenceTable() {
  const { preferences, loading, error, fetchPreferences, createPreference, updatePreference, deletePreference } = usePreferences();

  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "userId",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreference, setEditingPreference] = useState<Preference | null>(null);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredPreferences = [...preferences];
    if (hasSearchFilter) {
      filteredPreferences = filteredPreferences.filter((preference) =>
        preference.userId.toLowerCase().includes(filterValue.toLowerCase()) ||
        preference.dietaryRestrictions.some(restriction => 
          restriction.toLowerCase().includes(filterValue.toLowerCase())
        ) ||
        preference.favoriteCuisines.some(cuisine => 
          cuisine.toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }
    return filteredPreferences;
  }, [preferences, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Preference, b: Preference) => {
      const first = a[sortDescriptor.column as keyof Preference] as any;
      const second = b[sortDescriptor.column as keyof Preference] as any;
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

  const handleAddPreference = () => {
    setEditingPreference(null);
    setIsModalOpen(true);
  };

  const handleEditPreference = (preference: Preference) => {
    setEditingPreference(preference);
    setIsModalOpen(true);
  };

  const handleSavePreference = async (preferenceData: Partial<Preference>) => {
    if (editingPreference) {
      await updatePreference(editingPreference._id, preferenceData);
    } else {
      await createPreference(preferenceData);
    }
    fetchPreferences(); // Refresh data
  };

  const handleDeletePreference = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this preference?")) {
      await deletePreference(id);
      fetchPreferences(); // Refresh data
    }
  };

  const renderCell = useCallback((preference: Preference, columnKey: React.Key) => {
    const cellValue = preference[columnKey as keyof Preference];

    switch (columnKey) {
      case "dietaryRestrictions":
        return (
          <div className="flex flex-wrap gap-1">
            {preference.dietaryRestrictions.map((restriction) => (
              <Chip key={restriction} size="sm" color="primary" variant="flat">
                {restriction}
              </Chip>
            ))}
          </div>
        );
      case "allergies":
        return (
          <div className="flex flex-wrap gap-1">
            {preference.allergies.map((allergy) => (
              <Chip key={allergy} size="sm" color="danger" variant="flat">
                {allergy}
              </Chip>
            ))}
          </div>
        );
      case "favoriteCuisines":
        return (
          <div className="flex flex-wrap gap-1">
            {preference.favoriteCuisines.map((cuisine) => (
              <Chip key={cuisine} size="sm" color="success" variant="flat">
                {cuisine}
              </Chip>
            ))}
          </div>
        );
      case "budget":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">
              ${preference.budget.min} - ${preference.budget.max}
            </p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Button isIconOnly size="sm" variant="light" onPress={() => handleEditPreference(preference)}>
              <EditIcon className="text-lg text-default-400" />
            </Button>
            <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeletePreference(preference._id)}>
              <TrashIcon className="text-lg text-danger-500" />
            </Button>
          </div>
        );
      default:
        return cellValue as React.ReactNode;
    }
  }, [handleEditPreference, handleDeletePreference]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by user ID, dietary restrictions, or cuisines..."
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
            <Button color="primary" endContent={<PlusIcon />} onPress={handleAddPreference}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {preferences.length} preferences</span>
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
        aria-label="Preferences table"
        isHeaderSticky
        bottomContent={
          <div className="py-2 px-2 flex justify-between items-center">
            <span className="text-small text-default-400">
              {`Showing ${items.length} of ${filteredItems.length} preferences`}
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
          loadingContent={<Spinner label="Loading preferences..." />}
          emptyContent={!loading && !error ? "No preferences found" : "Error loading preferences"}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddPreferenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePreference}
        editingPreference={editingPreference}
      />
    </div>
  );
}
