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
  Chip,
  IconButton,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { MenuItemWithSelections } from '../lib/types';

interface SelectItemDialogProps {
  open: boolean;
  onClose: () => void;
  items: MenuItemWithSelections[];
  onSelect: (menuItemId: string, personName: string) => Promise<void>;
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSubmit = async () => {
    if (!personName.trim()) return;
    if (selectedItems.size === 0) return;

    setIsSubmitting(true);
    try {
      for (const itemId of selectedItems) {
        await onSelect(itemId, personName.trim());
      }
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPersonName('');
    setSelectedItems(new Set());
    onClose();
  };

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
                placeholder="VD: Phú"
              />
            )}
          />

          <Typography variant="subtitle1">Chọn món:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {items.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const hasAlreadySelected = item.selections.some(
                (s) => s.personName.toLowerCase() === personName.toLowerCase()
              );

              return (
                <Chip
                  key={item.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{item.name}</span>
                      {item.notes && (
                        <Typography component="span" variant="caption" sx={{ opacity: 0.7 }}>
                          + {item.notes}
                        </Typography>
                      )}
                      {item.selections.length > 0 && (
                        <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                          ({item.selections.length})
                        </Typography>
                      )}
                    </Box>
                  }
                  onClick={() => handleToggleItem(item.id)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  icon={
                    isSelected ? (
                      <RemoveIcon />
                    ) : (
                      <AddIcon />
                    )
                  }
                  onDelete={isSelected ? () => {} : undefined}
                  deleteIcon={isSelected ? <RemoveIcon /> : undefined}
                  sx={{
                    cursor: 'pointer',
                    opacity: hasAlreadySelected ? 0.6 : 1,
                  }}
                />
              );
            })}
          </Box>

          {selectedItems.size > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Đã chọn: {selectedItems.size} món
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!personName.trim() || selectedItems.size === 0 || isSubmitting}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
