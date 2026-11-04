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
          <Typography variant="h6" component="h2" sx={{ fontSize: '22px', fontWeight: 'bold' }}>
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
                      label={
                        item.maxQuantity !== null
                          ? `${item.selections.length}/${item.maxQuantity}`
                          : `${item.selections.length}`
                      }
                      size="small"
                      color={
                        item.maxQuantity !== null &&
                        item.selections.length >= item.maxQuantity
                          ? 'error'
                          : 'primary'
                      }
                      sx={{ minWidth: 28 }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {item.name}
                        {item.isArchived && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            (đã gỡ khỏi menu)
                          </Typography>
                        )}
                      </Typography>
                      {(() => {
                        const uniquePeople = Array.from(
                          new Set(
                            item.selections.map(
                              (s) =>
                                `${s.personName}${s.note?.trim() ? ` (${s.note.trim()})` : ""}`,
                            ),
                          ),
                        );
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Box sx={{ display: 'flex', gap: -0.5 }}>
                              {uniquePeople.slice(0, 3).map((personLabel) => {
                                const personName = personLabel.replace(/\s*\(.*\)$/, '');
                                const noteMatch = personLabel.match(/\((.*)\)$/);
                                const tooltipText = noteMatch
                                  ? `${personName} (${noteMatch[1]})`
                                  : personName;
                                return (
                                  <Tooltip
                                    key={personLabel}
                                    title={
                                      personName === currentPersonName
                                        ? `${tooltipText} (bạn)`
                                        : tooltipText
                                    }
                                  >
                                    <Avatar
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        fontSize: '0.65rem',
                                        bgcolor:
                                          personName === currentPersonName
                                            ? 'primary.main'
                                            : 'secondary.main',
                                        border: '2px solid',
                                        borderColor: 'background.paper',
                                        ml: -0.5,
                                        '&:first-of-type': { ml: 0 },
                                      }}
                                    >
                                      {personName.charAt(0).toUpperCase()}
                                    </Avatar>
                                  </Tooltip>
                                );
                              })}
                            </Box>
                            {uniquePeople.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{uniquePeople.length - 3}
                              </Typography>
                            )}
                          </Box>
                        );
                      })()}
                    </Box>
                  </Box>

                  {!isLocked && (() => {
                    const hasMySelection = item.selections.some(
                      (s) => s.personName === currentPersonName
                    );
                    return hasMySelection ? (
                      <Tooltip title="Xóa lựa chọn của bạn">
                        <IconButton
                          size="small"
                          onClick={() => onRemoveAllSelections(item.id)}
                        >
                          <DeleteSweepIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null;
                  })()}
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
