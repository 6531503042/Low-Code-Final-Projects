"use client";

import React, { useCallback, Key, ReactNode, SetStateAction, useState, useMemo } from "react";
import {
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
} from "@heroui/react";
import { EllipsisVertical, Pen, Trash, Plus, SearchIcon } from "lucide-react";
import { User } from "@/types/user";
import AddUserModal from "./AddUserModal";

type SortDescriptor = {
  column: string;
  direction: "ascending" | "descending";
};

type ModalProps = {
  add: boolean;
  confirm: boolean;
};

type ColumnProps = {
  name: string;
  uid: string;
  sortable: boolean;
} | {
  name: string;
  uid: string;
  sortable?: undefined;
};

export default function UserTable({
  users,
  loading,
  error,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}: {
  users: User[];
  loading: boolean;
  error: string | null;
  onCreateUser: (user: any) => Promise<void>;
  onUpdateUser: (id: string, user: any) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}) {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<"all" | Set<string | number>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(new Set(["username", "name", "email", "role", "actions"]));
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "username",
    direction: "ascending" as "ascending" | "descending",
  });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalProps>({
    add: false,
    confirm: false,
  });
  const [actionMode, setActionMode] = useState<"Add" | "Edit">("Add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const columns: ColumnProps[] = [
    { name: "USERNAME", uid: "username", sortable: true },
    { name: "NAME", uid: "name" },
    { name: "EMAIL", uid: "email" },
    { name: "ROLE", uid: "role" },
    { name: "TIMEZONE", uid: "timezone" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.username.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
        `${user.name.first} ${user.name.middle || ""} ${user.name.last}`.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredUsers;
  }, [users, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof User];
      const second = b[sortDescriptor.column as keyof User];

      if (first === undefined && second === undefined) return 0;
      if (first === undefined) return sortDescriptor.direction === "descending" ? 1 : -1;
      if (second === undefined) return sortDescriptor.direction === "descending" ? -1 : 1;

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (item: User, columnKey: Key) => {
      const cellValue = item[columnKey as keyof typeof item];

      switch (columnKey) {
        case "name":
          return `${item.name.first} ${item.name.middle || ""} ${item.name.last}`;
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVertical className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="edit"
                    startContent={<Pen size="16px" />}
                    onPress={() => {
                      setActionMode("Edit");
                      setSelectedUser(item);
                      setModal(prev => ({ ...prev, add: true }));
                    }}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<Trash size="16px" />}
                    onPress={() => {
                      setSelectedUser(item);
                      setModal(prev => ({ ...prev, confirm: true }));
                    }}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          if (typeof cellValue === "object" && cellValue !== null) {
            return JSON.stringify(cellValue);
          }
          return cellValue as ReactNode;
      }
    },
    [page, selectedKeys]
  );

  const handleAdd = async (userData: any) => {
    try {
      if (actionMode === "Add") {
        await onCreateUser(userData);
      } else if (actionMode === "Edit" && selectedUser) {
        await onUpdateUser(selectedUser._id, userData);
      }
      setModal(prev => ({ ...prev, add: false }));
      setSelectedUser(null);
    } catch (error) {
      console.error("Error handling user:", error);
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await onDeleteUser(selectedUser._id);
        setModal(prev => ({ ...prev, confirm: false }));
        setSelectedUser(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search users"
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
          <Button
            color="primary"
            endContent={<Plus size={20} />}
            onPress={() => {
              setActionMode("Add");
              setSelectedUser(null);
              setModal(prev => ({ ...prev, add: true }));
            }}
          >
            Add New User
          </Button>
        </div>
      </div>

      <Table
        isHeaderSticky
        aria-label="Users table"
        bottomContent={
          <div className="flex w-full justify-center">
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
        classNames={{
          wrapper: "min-h-[222px]",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        onSelectionChange={setSelectedKeys}
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
        <TableBody emptyContent={loading ? "Loading users..." : "No users found"} items={sortedItems}>
          {(item: User) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Add/Edit Modal */}
      <AddUserModal
        action={actionMode}
        isOpen={modal.add}
        user={selectedUser}
        onAdd={handleAdd}
        onClose={() => setModal(prev => ({ ...prev, add: false }))}
      />

      {/* Delete Confirmation Modal */}
      {modal.confirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col gap-4 min-w-[300px]">
            <div className="text-lg font-semibold">Confirm User Deletion</div>
            <div>Are you sure you want to delete user <span className="font-bold">{selectedUser?.username}</span>?</div>
            <div className="flex gap-2 justify-end">
              <Button variant="light" onPress={() => setModal(prev => ({ ...prev, confirm: false }))}>
                Cancel
              </Button>
              <Button color="danger" onPress={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
