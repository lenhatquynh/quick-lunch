'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import type { MenuItemWithSelections } from '../lib/types';

interface SelectionCardProps {
  items: MenuItemWithSelections[];
  isLocked: boolean;
  onAddSelection: () => void;
  onRemoveSelection: (selectionId: string) => void;
  onRemoveAllSelections: (menuItemId: string) => void;
  currentPersonName: string;
}

export default function SelectionCard({
  items,
  isLocked,
  onAddSelection,
  onRemoveSelection,
  onRemoveAllSelections,
  currentPersonName,
}: SelectionCardProps) {
  const totalSelections = items.reduce((acc, item) => acc + item.selections.length, 0);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontSize: '24px' }}>
            📝 Món đã chọn
          </Typography>
          {!isLocked && (
            <Button
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={onAddSelection}
              variant="contained"
            >
              Chọn món
            </Button>
          )}
        </Box>

        {totalSelections === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              opacity: 0.6,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Chưa có ai chọn món
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hãy là người đầu tiên!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {items.map((item) => {
              if (item.selections.length === 0) return null;

              return (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Chip
                      label={`${item.selections.length}`}
                      size="small"
                      color="primary"
                      sx={{ minWidth: 28 }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {item.name}
                      </Typography>
                      {(() => {
                        const uniquePeople = Array.from(
                          new Set(item.selections.map((s) => s.personName))
                        );
                        return (
                          <AvatarGroup max={4} sx={{ mt: 0.5 }}>
                            {uniquePeople.map((personName) => (
                              <Tooltip
                                key={personName}
                                title={
                                  personName === currentPersonName
                                    ? `${personName} (bạn)`
                                    : personName
                                }
                              >
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    fontSize: '0.75rem',
                                    bgcolor:
                                      personName === currentPersonName
                                        ? 'primary.main'
                                        : 'secondary.main',
                                  }}
                                >
                                  {personName.charAt(0).toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                        );
                      })()}
                    </Box>
                  </Box>

                  {!isLocked && (
                    <Tooltip title="Xóa lựa chọn của bạn">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const mySelection = item.selections.find(
                            (s) => s.personName === currentPersonName
                          );
                          if (mySelection) {
                            onRemoveSelection(mySelection.id);
                          }
                        }}
                      >
                        <DeleteSweepIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
