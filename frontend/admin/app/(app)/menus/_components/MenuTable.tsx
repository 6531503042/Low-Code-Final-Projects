"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Pagination, Spinner, Image, Chip,
} from "@heroui/react";
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, ChevronDownIcon } from "lucide-react";
import { Menu } from "@/types/menu";
import { AddMenuModal } from "./AddMenuModal";
import { useMenus } from "@/hooks/useMenus";

type SortDescriptor = {
  column: string;
  direction: "ascending" | "descending";
};

const columns = [
  { name: "IMAGE", uid: "image", sortable: false },
  { name: "NAME", uid: "name", sortable: true },
  { name: "CUISINE", uid: "cuisine", sortable: true },
  { name: "TYPE", uid: "type", sortable: true },
  { name: "PRICE", uid: "price", sortable: true },
  { name: "STATUS", uid: "available", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["image", "name", "cuisine", "type", "price", "available", "actions"];

export function MenuTable() {
  const { menus, loading, error, fetchMenus, createMenu, updateMenu, deleteMenu } = useMenus();

  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredMenus = [...menus];
    if (hasSearchFilter) {
      filteredMenus = filteredMenus.filter((menu) =>
        menu.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        menu.cuisine.toLowerCase().includes(filterValue.toLowerCase()) ||
        menu.type.toLowerCase().includes(filterValue.toLowerCase()) ||
        menu.description.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredMenus;
  }, [menus, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Menu, b: Menu) => {
      const first = a[sortDescriptor.column as keyof Menu] as any;
      const second = b[sortDescriptor.column as keyof Menu] as any;
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

  const handleAddMenu = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleSaveMenu = async (menuData: Partial<Menu>) => {
    if (editingMenu) {
      await updateMenu(editingMenu._id, menuData);
    } else {
      await createMenu(menuData);
    }
    fetchMenus(); // Refresh data
  };

  const handleDeleteMenu = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this menu?")) {
      await deleteMenu(id);
      fetchMenus(); // Refresh data
    }
  };

  const renderCell = useCallback((menu: Menu, columnKey: React.Key) => {
    const cellValue = menu[columnKey as keyof Menu];

    switch (columnKey) {
      case "image":
        return (
          <div className="flex items-center">
            <Image
              alt={menu.name}
              className="object-cover"
              height={40}
              shadow="sm"
              src={menu.imageUrl || "/placeholder-food.jpg"}
              width={40}
            />
          </div>
        );
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{menu.name}</p>
            <p className="text-bold text-tiny text-default-400 line-clamp-2">{menu.description}</p>
          </div>
        );
      case "cuisine":
        return (
          <Chip className="capitalize" color="primary" size="sm" variant="flat">
            {menu.cuisine}
          </Chip>
        );
      case "type":
        return (
          <Chip className="capitalize" color="secondary" size="sm" variant="flat">
            {menu.type}
          </Chip>
        );
      case "price":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">${menu.price.toFixed(2)}</p>
          </div>
        );
      case "available":
        return (
          <Chip className="capitalize" color={menu.available ? "success" : "danger"} size="sm" variant="flat">
            {menu.available ? "Available" : "Unavailable"}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Button isIconOnly size="sm" variant="light" onPress={() => handleEditMenu(menu)}>
              <EditIcon className="text-lg text-default-400" />
            </Button>
            <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeleteMenu(menu._id)}>
              <TrashIcon className="text-lg text-danger-500" />
            </Button>
          </div>
        );
      default:
        return cellValue as React.ReactNode;
    }
  }, [handleEditMenu, handleDeleteMenu]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name, cuisine, or type..."
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
            <Button color="primary" endContent={<PlusIcon />} onPress={handleAddMenu}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {menus.length} menus</span>
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
        aria-label="Menus table"
        isHeaderSticky
        bottomContent={
          <div className="py-2 px-2 flex justify-between items-center">
            <span className="text-small text-default-400">
              {`Showing ${items.length} of ${filteredItems.length} menus`}
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
          loadingContent={<Spinner label="Loading menus..." />}
          emptyContent={!loading && !error ? "No menus found" : "Error loading menus"}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddMenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMenu}
        editingMenu={editingMenu}
      />
    </div>
  );
}
