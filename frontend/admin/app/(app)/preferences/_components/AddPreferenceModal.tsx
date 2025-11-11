"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Slider } from "@heroui/react";
import { Preference } from "@/types/preference";

type AddPreferenceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preference: Partial<Preference>) => void;
  editingPreference?: Preference | null;
};

export function AddPreferenceModal({ isOpen, onClose, onSave, editingPreference }: AddPreferenceModalProps) {
  const [userId, setUserId] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(100);

  const dietaryOptions = [
    "vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo", "halal", "kosher"
  ];

  const allergyOptions = [
    "nuts", "dairy", "eggs", "soy", "wheat", "fish", "shellfish", "sesame"
  ];

  const cuisineOptions = [
    "Thai", "Japanese", "Chinese", "Italian", "Mexican", "Indian", "Korean", "American", "French", "Vietnamese"
  ];

  const ingredientOptions = [
    "onions", "garlic", "mushrooms", "tomatoes", "peppers", "spicy", "sweet", "sour", "bitter"
  ];

  useEffect(() => {
    if (editingPreference) {
      setUserId(editingPreference.userId || "");
      setDietaryRestrictions(editingPreference.dietaryRestrictions || []);
      setAllergies(editingPreference.allergies || []);
      setFavoriteCuisines(editingPreference.favoriteCuisines || []);
      setDislikedIngredients(editingPreference.dislikedIngredients || []);
      setBudgetMin(editingPreference.budget?.min || 0);
      setBudgetMax(editingPreference.budget?.max || 100);
    } else {
      setUserId("");
      setDietaryRestrictions([]);
      setAllergies([]);
      setFavoriteCuisines([]);
      setDislikedIngredients([]);
      setBudgetMin(0);
      setBudgetMax(100);
    }
  }, [editingPreference, isOpen]);

  const handleSubmit = () => {
    const preferenceData: Partial<Preference> = {
      userId,
      dietaryRestrictions,
      allergies,
      favoriteCuisines,
      dislikedIngredients,
      budget: {
        min: budgetMin,
        max: budgetMax,
      },
    };
    onSave(preferenceData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>{editingPreference ? "Edit Preference" : "Add New Preference"}</ModalHeader>
        <ModalBody>
          <Input
            label="User ID"
            placeholder="Enter user ID"
            value={userId}
            onValueChange={setUserId}
            isRequired
          />
          
          <Select
            label="Dietary Restrictions"
            placeholder="Select dietary restrictions"
            selectedKeys={dietaryRestrictions}
            onSelectionChange={(keys) => setDietaryRestrictions(Array.from(keys) as string[])}
            selectionMode="multiple"
          >
            {dietaryOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Allergies"
            placeholder="Select allergies"
            selectedKeys={allergies}
            onSelectionChange={(keys) => setAllergies(Array.from(keys) as string[])}
            selectionMode="multiple"
          >
            {allergyOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Favorite Cuisines"
            placeholder="Select favorite cuisines"
            selectedKeys={favoriteCuisines}
            onSelectionChange={(keys) => setFavoriteCuisines(Array.from(keys) as string[])}
            selectionMode="multiple"
          >
            {cuisineOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Disliked Ingredients"
            placeholder="Select disliked ingredients"
            selectedKeys={dislikedIngredients}
            onSelectionChange={(keys) => setDislikedIngredients(Array.from(keys) as string[])}
            selectionMode="multiple"
          >
            {ingredientOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Budget Range</label>
            <div className="flex gap-4 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={budgetMin.toString()}
                onValueChange={(value) => setBudgetMin(parseInt(value) || 0)}
                startContent="$"
                className="w-20"
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="Max"
                value={budgetMax.toString()}
                onValueChange={(value) => setBudgetMax(parseInt(value) || 100)}
                startContent="$"
                className="w-20"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            {editingPreference ? "Save Changes" : "Add Preference"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
