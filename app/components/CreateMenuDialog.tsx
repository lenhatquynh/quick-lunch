"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { MenuWithItems } from "../lib/types";

interface CreateMenuDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editMenu?: MenuWithItems | null;
}

interface MenuItemInput {
  name: string;
  notes?: string;
}

export default function CreateMenuDialog({
  open,
  onClose,
  onSuccess,
  editMenu,
}: CreateMenuDialogProps) {
  const isEditMode = !!editMenu;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? "Sửa Menu" : "Tạo Menu Mới"}</DialogTitle>
      <DialogContent>
        <MenuForm
          key={`menu-form-${open}`}
          editMenu={editMenu}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

function MenuForm({
  editMenu,
  onSuccess,
  onClose,
}: {
  editMenu?: MenuWithItems | null;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [creatorName, setCreatorName] = useState(editMenu?.creatorName ?? "");
  const [items, setItems] = useState<MenuItemInput[]>(
    editMenu
      ? editMenu.items.map((item) => ({
          name: item.name,
          notes: item.notes || undefined,
        }))
      : [{ name: "" }, { name: "" }, { name: "" }],
  );
  const [error, setError] = useState("");
  const [bulkPasteOpen, setBulkPasteOpen] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!editMenu;

  const hasValidCreatorName = !isEditMode && creatorName.trim();
  const hasValidItems = items.some((item) => item.name.trim());
  const canSubmit = hasValidCreatorName && hasValidItems && !isSubmitting;

  const handleAddItem = () => {
    setItems([...items, { name: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: "name" | "notes",
    value: string,
  ) => {
    const newItems = [...items];
    if (field === "name") {
      newItems[index].name = value;
    } else {
      newItems[index].notes = value;
    }
    setItems(newItems);
  };

  const parseItemsFromText = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    return lines.map((line) => {
      const cleaned = line.replace(/^\d+[\/\.\-\)]\s*/, "").trim();
      const parts = cleaned.split("+").map((p) => p.trim());
      return {
        name: parts[0],
        notes: parts.length > 1 ? parts.slice(1).join(" + ") : undefined,
      };
    });
  };

  const handleBulkPasteOpen = () => {
    setBulkPasteText("");
    setBulkPasteOpen(true);
  };

  const handleBulkPasteConfirm = () => {
    const parsed = parseItemsFromText(bulkPasteText);
    if (parsed.length > 0) {
      setItems(parsed);
    }
    setBulkPasteOpen(false);
    setBulkPasteText("");
  };

  const handleBulkPasteCancel = () => {
    setBulkPasteOpen(false);
    setBulkPasteText("");
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!isEditMode && !creatorName.trim()) {
      setError("Vui lòng nhập tên người tạo menu");
      return;
    }

    const validItems = items.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      setError("Vui lòng nhập ít nhất 1 món ăn");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editMenu) {
        const response = await fetch(`/api/menu/${editMenu.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: validItems,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update menu");
        }
      } else {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            creatorName: creatorName.trim(),
            items: validItems,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create menu");
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      {!isEditMode && (
        <TextField
          label="Tên người tạo menu"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          fullWidth
          placeholder="VD: Sơn Tùng MTP"
        />
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1">Danh sách món ăn</Typography>
        <Button size="small" onClick={handleBulkPasteOpen}>
          Dán nhiều món
        </Button>
      </Box>

      <Paper
        variant="outlined"
        sx={{ p: 2, maxHeight: 300, overflow: "auto" }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((item, index) => (
            <Box
              key={index}
              sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
            >
              <TextField
                size="small"
                placeholder={`Món ${index + 1}`}
                value={item.name}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
                sx={{ flex: 2 }}
              />
              <TextField
                size="small"
                placeholder="Ghi chú (VD: + nước mắm)"
                value={item.notes || ""}
                onChange={(e) =>
                  handleItemChange(index, "notes", e.target.value)
                }
                sx={{ flex: 1 }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length <= 1}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Paper>

      <Button startIcon={<AddIcon />} onClick={handleAddItem}>
        Thêm món
      </Button>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isEditMode && !canSubmit}
        >
          {isSubmitting ? "Đang xử lý..." : (isEditMode ? "Cập nhật Menu" : "Tạo Menu")}
        </Button>
      </DialogActions>

      {/* Custom Bulk Paste Modal */}
      <Dialog
        open={bulkPasteOpen}
        onClose={handleBulkPasteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dán nhiều món</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Dán danh sách món ăn (mỗi món 1 dòng)
          </Typography>
          <TextField
            multiline
            rows={8}
            fullWidth
            placeholder={`Cá File Chiên\nGà Chiên Mắm\n1/Cơm Rang Dương Châu`}
            value={bulkPasteText}
            onChange={(e) => setBulkPasteText(e.target.value)}
            autoFocus
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Hỗ trợ: số thứ tự (1/, 1., 1-), ghi chú (+ nước mắm)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkPasteCancel}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleBulkPasteConfirm}
            disabled={!bulkPasteText.trim()}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
