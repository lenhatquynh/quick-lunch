'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import type { MenuItemWithSelections, SelectionSummary, PersonSummary } from '../lib/types';

interface SummaryCardProps {
  items: MenuItemWithSelections[];
  isLocked: boolean;
  onLockToggle: () => void;
  isLocking: boolean;
}

type ViewMode = 'default' | 'byPerson';

export default function SummaryCard({
  items,
  isLocked,
  onLockToggle,
  isLocking,
}: SummaryCardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [copied, setCopied] = useState(false);

  const itemSummary: SelectionSummary[] = useMemo(() => {
    return items
      .filter((item) => item.selections.length > 0)
      .map((item) => ({
        itemId: item.id,
        itemName: item.name,
        totalCount: item.selections.length,
        notes: item.notes,
        people: item.selections.map((s) => s.personName),
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [items]);

  const personSummary: PersonSummary[] = useMemo(() => {
    const personMap = new Map<string, { itemName: string; notes: string | null }[]>();

    items.forEach((item) => {
      item.selections.forEach((selection) => {
        const existing = personMap.get(selection.personName) || [];
        existing.push({ itemName: item.name, notes: item.notes });
        personMap.set(selection.personName, existing);
      });
    });

    return Array.from(personMap.entries())
      .map(([personName, selections]) => ({
        personName,
        selections,
      }))
      .sort((a, b) => b.selections.length - a.selections.length);
  }, [items]);

  const totalItems = itemSummary.reduce((acc, item) => acc + item.totalCount, 0);

  const generateText = () => {
    if (viewMode === 'default') {
      return itemSummary
        .map(
          (item) =>
            `${item.totalCount} ${item.itemName}${item.notes ? ` + ${item.notes}` : ''} (${item.people.join(', ')})`
        )
        .join('\n');
    } else {
      return personSummary
        .map(
          (person) =>
            `${person.personName}: ${person.selections
              .map((s) => `1 ${s.itemName}${s.notes ? ` + ${s.notes}` : ''}`)
              .join(', ')}`
        )
        .join('\n');
    }
  };

  const handleCopy = async () => {
    const text = generateText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            📊 Tổng kết
          </Typography>
          <Chip
            label={`${totalItems} món đã chọn`}
            color="primary"
            size="small"
          />
        </Box>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="default">Theo món</ToggleButton>
          <ToggleButton value="byPerson">Theo người</ToggleButton>
        </ToggleButtonGroup>

        <Divider sx={{ my: 2 }} />

        {itemSummary.length === 0 ? (
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
              Chưa có dữ liệu
            </Typography>
          </Box>
        ) : viewMode === 'default' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {itemSummary.map((item) => (
              <Box
                key={item.itemId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Chip label={`${item.totalCount}`} size="small" color="primary" />
                <Typography variant="body2" sx={{ fontWeight: 'medium', flex: 1 }}>
                  {item.itemName}
                  {item.notes && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}
                      + {item.notes}
                    </Typography>
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({item.people.join(', ')})
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {personSummary.map((person) => (
              <Box key={person.personName}>
                <Typography variant="subtitle2" gutterBottom>
                  {person.personName}:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {person.selections
                    .map((s) => `1 ${s.itemName}${s.notes ? ` + ${s.notes}` : ''}`)
                    .join(', ')}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
          onClick={handleCopy}
          disabled={itemSummary.length === 0}
          fullWidth
        >
          {copied ? 'Đã copy!' : 'Copy text'}
        </Button>
        <Button
          variant={isLocked ? 'contained' : 'outlined'}
          color={isLocked ? 'error' : 'primary'}
          startIcon={isLocked ? <LockIcon /> : <LockOpenIcon />}
          onClick={onLockToggle}
          disabled={isLocking}
          fullWidth
        >
          {isLocked ? 'Mở khóa' : 'Chốt đơn'}
        </Button>
      </Box>
    </Card>
  );
}
