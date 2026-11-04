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
import { useUpdateMenu } from "../hooks/useApi";
import type { MenuWithItems } from "../lib/types";

interface CreateMenuDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editMenu?: MenuWithItems | null;
}

interface MenuItemInput {
  id?: string;
  name: string;
  notes?: string;
  maxQuantity?: number | null;
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
      ? editMenu.items
          .filter((item) => !item.isArchived)
          .map((item) => ({
              id: item.id,
              name: item.name,
              notes: item.notes || undefined,
              maxQuantity: item.maxQuantity ?? null,
            }))
      : [{ name: "" }, { name: "" }, { name: "" }],
  );
  const [error, setError] = useState("");
  const [bulkPasteOpen, setBulkPasteOpen] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateMenu = useUpdateMenu();

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
    field: "name" | "notes" | "maxQuantity",
    value: string,
  ) => {
    const newItems = [...items];
    if (field === "name") {
      newItems[index].name = value;
    } else if (field === "maxQuantity") {
      newItems[index].maxQuantity = value.trim() ? Math.max(1, parseInt(value, 10)) : null;
    } else {
      newItems[index].notes = value;
    }
    setItems(newItems);
  };

  const parseItemsFromText = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    return lines.map((line) => {
      const cleaned = line.replace(/^\d+[\/\.\-\)]\s*/, "").trim();
      // Hỗ trợ giới hạn số lượng dạng "Tên món x5" hoặc "Tên món (max 5)"
      let maxQuantity: number | null = null;
      let namePart = cleaned;
      const maxMatch = cleaned.match(/\s*x(\d+)\s*$/i) || cleaned.match(/\s*\(max\s*(\d+)\)\s*$/i);
      if (maxMatch) {
        maxQuantity = Math.max(1, parseInt(maxMatch[1], 10));
        namePart = cleaned.slice(0, maxMatch.index).trim();
      }
      const parts = namePart.split("+").map((p) => p.trim());
      return {
        name: parts[0],
        notes: parts.length > 1 ? parts.slice(1).join(" + ") : undefined,
        maxQuantity,
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
      setError("Vui lòng nhập tên menu");
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
        await updateMenu.mutateAsync({
          id: editMenu.id,
          items: validItems,
        });
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {!isEditMode && (
        <TextField
          label="Menu"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          fullWidth
          placeholder="VD: Bữa trưa T4 01/12/2026"
        />
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1">Danh sách món</Typography>
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
              <TextField
                size="small"
                type="number"
                label="Tối đa"
                placeholder="∞"
                value={item.maxQuantity ?? ""}
                onChange={(e) =>
                  handleItemChange(index, "maxQuantity", e.target.value)
                }
                slotProps={{ htmlInput: { min: 1 } }}
                sx={{ width: 90 }}
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
        <DialogTitle>Dán Menu</DialogTitle>
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
            Hỗ trợ: số thứ tự (1/, 1., 1-), ghi chú (+ nước mắm), giới hạn số
            lượng (x5 hoặc (max 5))
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
