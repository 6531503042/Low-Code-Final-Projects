"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Textarea, Switch } from "@heroui/react";
import { Menu } from "@/types/menu";

type AddMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (menu: Partial<Menu>) => void;
  editingMenu?: Menu | null;
};

export function AddMenuModal({ isOpen, onClose, onSave, editingMenu }: AddMenuModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [available, setAvailable] = useState(true);

  const cuisineOptions = [
    "Thai", "Japanese", "Chinese", "Italian", "Mexican", "Indian", "Korean", "American", "French", "Vietnamese"
  ];

  const mealTypeOptions = [
    "breakfast", "lunch", "dinner", "snack", "dessert", "beverage"
  ];

  useEffect(() => {
    if (editingMenu) {
      setName(editingMenu.name || "");
      setDescription(editingMenu.description || "");
      setPrice(editingMenu.price?.toString() || "");
      setCuisine(editingMenu.cuisine || "");
      setType(editingMenu.type || "");
      setImageUrl(editingMenu.imageUrl || "");
      setAvailable(editingMenu.available ?? true);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setCuisine("");
      setType("");
      setImageUrl("");
      setAvailable(true);
    }
  }, [editingMenu, isOpen]);

  const handleSubmit = () => {
    const menuData: Partial<Menu> = {
      name,
      description,
      price: parseFloat(price) || 0,
      cuisine,
      type,
      imageUrl,
      available,
    };
    onSave(menuData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>{editingMenu ? "Edit Menu" : "Add New Menu"}</ModalHeader>
        <ModalBody>
          <Input
            label="Menu Name"
            placeholder="Enter menu name"
            value={name}
            onValueChange={setName}
            isRequired
          />
          <Textarea
            label="Description"
            placeholder="Enter menu description"
            value={description}
            onValueChange={setDescription}
            isRequired
          />
          <Input
            label="Price"
            type="number"
            placeholder="Enter price"
            value={price}
            onValueChange={setPrice}
            isRequired
            startContent="$"
          />
          <Select
            label="Cuisine"
            placeholder="Select cuisine"
            selectedKeys={cuisine ? [cuisine] : []}
            onSelectionChange={(keys) => setCuisine(Array.from(keys)[0] as string)}
            isRequired
          >
            {cuisineOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Meal Type"
            placeholder="Select meal type"
            selectedKeys={type ? [type] : []}
            onSelectionChange={(keys) => setType(Array.from(keys)[0] as string)}
            isRequired
          >
            {mealTypeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
          <Input
            label="Image URL"
            placeholder="Enter image URL"
            value={imageUrl}
            onValueChange={setImageUrl}
          />
          <div className="flex items-center gap-2">
            <Switch
              isSelected={available}
              onValueChange={setAvailable}
            />
            <span className="text-sm">Available</span>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            {editingMenu ? "Save Changes" : "Add Menu"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
