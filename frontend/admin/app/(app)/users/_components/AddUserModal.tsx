import React, { FormEvent, useEffect, useState } from "react";
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@heroui/react";
import { User, CreateUserData } from "@/types/user";

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: CreateUserData) => void;
  action: "Add" | "Edit";
  user: User | null;
};

export default function AddUserModal({ isOpen, onClose, onAdd, action, user }: AddUserModalProps) {
  const resetField: CreateUserData = {
    name: {
      first: "",
      middle: "",
      last: "",
    },
    username: "",
    email: "",
    role: "user",
    timezone: "UTC",
  };

  const [field, setField] = useState<CreateUserData>(resetField);

  useEffect(() => {
    if (action === "Add") {
      setField(resetField);
    } else if (user && action === "Edit") {
      setField({
        name: {
          first: user.name?.first || "",
          middle: user.name?.middle || "",
          last: user.name?.last || "",
        },
        username: user.username || "",
        email: user.email || "",
        role: user.role || "user",
        timezone: user.timezone || "UTC",
      });
    }
  }, [isOpen, user, action]);

  const handleClose = () => {
    setField(resetField);
    onClose();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAdd(field);
  };

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalContent>
        <Form className="w-full" onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            {action === "Add" ? "Add new user" : "Edit user"}
          </ModalHeader>
          <ModalBody className="w-full">
            <Input
              isRequired
              label="Username"
              placeholder="Enter username"
              value={field.username}
              onChange={(e) => setField(prev => ({ ...prev, username: e.target.value }))}
            />
            <Input
              isRequired
              label="Email"
              placeholder="Enter email"
              type="email"
              value={field.email}
              onChange={(e) => setField(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              isRequired
              label="First Name"
              placeholder="Enter first name"
              value={field.name.first}
              onChange={(e) => setField(prev => ({ 
                ...prev, 
                name: { ...prev.name, first: e.target.value } 
              }))}
            />
            <Input
              label="Middle Name"
              placeholder="Enter middle name"
              value={field.name.middle}
              onChange={(e) => setField(prev => ({ 
                ...prev, 
                name: { ...prev.name, middle: e.target.value } 
              }))}
            />
            <Input
              isRequired
              label="Last Name"
              placeholder="Enter last name"
              value={field.name.last}
              onChange={(e) => setField(prev => ({ 
                ...prev, 
                name: { ...prev.name, last: e.target.value } 
              }))}
            />
            <Select
              isRequired
              label="Role"
              placeholder="Select role"
              selectedKeys={new Set([field.role])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setField(prev => ({ ...prev, role: selected as "admin" | "user" }));
              }}
            >
              <SelectItem key="user">User</SelectItem>
              <SelectItem key="admin">Admin</SelectItem>
            </Select>
            <Input
              isRequired
              label="Timezone"
              placeholder="Enter timezone"
              value={field.timezone}
              onChange={(e) => setField(prev => ({ ...prev, timezone: e.target.value }))}
            />
          </ModalBody>
          <ModalFooter className="w-full">
            <Button color="danger" variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              {action === "Add" ? "Create" : "Update"}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
}
