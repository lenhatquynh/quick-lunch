'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { MenuItemWithSelections } from '../lib/types';

interface SelectItemDialogProps {
  open: boolean;
  onClose: () => void;
  items: MenuItemWithSelections[];
  onSelect: (menuItemId: string, personName: string, quantity: number) => Promise<void>;
  existingNames: string[];
}

export default function SelectItemDialog({
  open,
  onClose,
  items,
  onSelect,
  existingNames,
}: SelectItemDialogProps) {
  const [personName, setPersonName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      newMap.set(itemId, (newMap.get(itemId) || 0) + 1);
      return newMap;
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(itemId) || 1;
      if (current > 1) {
        newMap.set(itemId, current - 1);
      } else {
        newMap.delete(itemId);
      }
      return newMap;
    });
  };

  const handleSubmit = async () => {
    if (!personName.trim()) return;
    if (selectedItems.size === 0) return;

    setIsSubmitting(true);
    try {
      for (const [itemId, quantity] of selectedItems) {
        await onSelect(itemId, personName.trim(), quantity);
      }
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPersonName('');
    setSelectedItems(new Map());
    onClose();
  };

  const totalQuantity = Array.from(selectedItems.values()).reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chọn món ăn</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Autocomplete
            freeSolo
            options={existingNames}
            inputValue={personName}
            onInputChange={(_, value) => setPersonName(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tên của bạn"
                placeholder="VD: Sơn Tùng MTP"
              />
            )}
          />

          <Typography variant="subtitle1">Chọn món (nhấn + / - để tăng/giảm số lượng):</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map((item) => {
              const quantity = selectedItems.get(item.id) || 0;
              const hasAlreadySelected = item.selections.some(
                (s) => s.personName.toLowerCase() === personName.toLowerCase()
              );

              return (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    border: '1px solid',
                    borderColor: quantity > 0 ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    opacity: hasAlreadySelected ? 0.6 : 1,
                    bgcolor: quantity > 0 ? 'action.selected' : 'transparent',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: quantity > 0 ? 600 : 400 }}>
                      {item.name}
                    </Typography>
                    {item.notes && (
                      <Typography variant="caption" color="text.secondary">
                        + {item.notes}
                      </Typography>
                    )}
                    {item.selections.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({item.selections.length} đã chọn)
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={quantity === 0}
                      sx={{ minWidth: 36, width: 36, height: 36, p: 0 }}
                    >
                      <RemoveIcon fontSize="small" />
                    </Button>
                    <Typography
                      variant="body1"
                      sx={{
                        minWidth: 24,
                        textAlign: 'center',
                        fontWeight: 600,
                        color: quantity > 0 ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {quantity}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddItem(item.id)}
                      sx={{ minWidth: 36, width: 36, height: 36, p: 0 }}
                    >
                      <AddIcon fontSize="small" />
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {totalQuantity > 0 && (
            <Typography variant="body2" color="primary">
              Đã chọn: {totalQuantity} món ({selectedItems.size} loại)
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!personName.trim() || totalQuantity === 0 || isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
