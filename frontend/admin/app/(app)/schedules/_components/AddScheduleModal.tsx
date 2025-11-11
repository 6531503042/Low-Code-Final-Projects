"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Switch } from "@heroui/react";
import { Schedule } from "@/types/schedule";

type AddScheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: Partial<Schedule>) => void;
  editingSchedule?: Schedule | null;
};

export function AddScheduleModal({ isOpen, onClose, onSave, editingSchedule }: AddScheduleModalProps) {
  const [userId, setUserId] = useState("");
  const [mealType, setMealType] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const mealTypeOptions = [
    "breakfast", "lunch", "dinner", "snack", "dessert", "beverage"
  ];

  const dayOptions = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  useEffect(() => {
    if (editingSchedule) {
      setUserId(editingSchedule.userId || "");
      setMealType(editingSchedule.mealType || "");
      setPreferredTime(editingSchedule.preferredTime || "");
      setDayOfWeek(editingSchedule.dayOfWeek || []);
      setIsActive(editingSchedule.isActive ?? true);
    } else {
      setUserId("");
      setMealType("");
      setPreferredTime("");
      setDayOfWeek([]);
      setIsActive(true);
    }
  }, [editingSchedule, isOpen]);

  const handleSubmit = () => {
    const scheduleData: Partial<Schedule> = {
      userId,
      mealType,
      preferredTime,
      dayOfWeek,
      isActive,
    };
    onSave(scheduleData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>{editingSchedule ? "Edit Schedule" : "Add New Schedule"}</ModalHeader>
        <ModalBody>
          <Input
            label="User ID"
            placeholder="Enter user ID"
            value={userId}
            onValueChange={setUserId}
            isRequired
          />
          
          <Select
            label="Meal Type"
            placeholder="Select meal type"
            selectedKeys={mealType ? [mealType] : []}
            onSelectionChange={(keys) => setMealType(Array.from(keys)[0] as string)}
            isRequired
          >
            {mealTypeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="Preferred Time"
            type="time"
            placeholder="Select preferred time"
            value={preferredTime}
            onValueChange={setPreferredTime}
            isRequired
          />

          <Select
            label="Days of Week"
            placeholder="Select days of week"
            selectedKeys={dayOfWeek}
            onSelectionChange={(keys) => setDayOfWeek(Array.from(keys) as string[])}
            selectionMode="multiple"
            isRequired
          >
            {dayOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              isSelected={isActive}
              onValueChange={setIsActive}
            />
            <span className="text-sm">Active</span>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            {editingSchedule ? "Save Changes" : "Add Schedule"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
