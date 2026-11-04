"use client";

import { useState, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { MenuItemWithSelections, SelectionSummary } from "../lib/types";

interface SummaryCardProps {
  items: MenuItemWithSelections[];
  isLocked: boolean;
  onLockToggle: () => void;
  isLocking: boolean;
}

type ViewMode = "default" | "byPerson";

// Định dạng tên người kèm note: "Quỳnh (cơm ít)"
function formatPerson(personName: string, note?: string | null) {
  const trimmed = note?.trim();
  return trimmed ? `${personName} (${trimmed})` : personName;
}

export default function SummaryCard({
  items,
  isLocked,
  onLockToggle,
  isLocking,
}: SummaryCardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [copied, setCopied] = useState(false);
  const [confirmLockOpen, setConfirmLockOpen] = useState(false);

  const itemSummary: SelectionSummary[] = useMemo(() => {
    return items
      .filter((item) => item.selections.length > 0)
      .map((item) => {
        const people = item.selections.map((s) => formatPerson(s.personName, s.note));
        const groupedPeople = Array.from(
          people.reduce((acc, name) => {
            acc.set(name, (acc.get(name) || 0) + 1);
            return acc;
          }, new Map<string, number>()),
        ).map(([name, count]) => (count > 1 ? `${name} x${count}` : name));

        return {
          itemId: item.id,
          itemName: item.name,
          totalCount: item.selections.length,
          maxQuantity: item.maxQuantity,
          notes: item.notes,
          people: groupedPeople,
        };
      })
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [items]);

  const personSummary = useMemo(() => {
    const personMap = new Map<
      string,
      Map<string, { notes: string | null; count: number }>
    >();

    items.forEach((item) => {
      item.selections.forEach((selection) => {
        if (!personMap.has(selection.personName)) {
          personMap.set(selection.personName, new Map());
        }
        const itemMap = personMap.get(selection.personName)!;
        const key = item.name;
        const existing = itemMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          itemMap.set(key, { notes: item.notes, count: 1 });
        }
      });
    });

    return Array.from(personMap.entries())
      .map(([personName, itemMap]) => {
        const selections = Array.from(itemMap.entries()).map(
          ([itemName, data]) => ({
            itemName,
            notes: data.notes,
            count: data.count,
          }),
        );
        const totalItems = selections.reduce((acc, s) => acc + s.count, 0);
        // Note của người (có thể khác nhau theo từng món)
        const personNotes = Array.from(
          new Set(
            items
              .flatMap((item) =>
                item.selections
                  .filter(
                    (s) =>
                      s.personName === personName &&
                      s.note &&
                      s.note.trim(),
                  )
                  .map((s) => s.note!.trim()),
              ),
          ),
        );
        return {
          personName,
          selections,
          totalItems,
          notes: personNotes,
        };
      })
      .sort((a, b) => b.totalItems - a.totalItems);
  }, [items]);

  const generateText = () => {
    if (viewMode === "default") {
      return itemSummary
        .map(
          (item) =>
            `${item.totalCount} ${item.itemName}${item.notes ? ` + ${item.notes}` : ""} (${item.people.join(", ")})`,
        )
        .join("\n");
    } else {
      return personSummary
        .map(
          (person) =>
            `${formatPerson(person.personName, person.notes.join(", "))}: ${person.selections
              .map(
                (s) =>
                  `${s.count} ${s.itemName}${s.notes ? ` + ${s.notes}` : ""}`,
              )
              .join(", ")}`,
        )
        .join("\n");
    }
  };

  const handleCopy = async () => {
    const text = generateText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontSize: '22px', fontWeight: 'bold' }}>
            📊 Tổng kết
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="default">Theo món</ToggleButton>
            <ToggleButton value="byPerson">Theo người</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {itemSummary.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
              opacity: 0.6,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Chưa có dữ liệu
            </Typography>
          </Box>
        ) : viewMode === "default" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {itemSummary.map((item) => (
              <Box
                key={item.itemId}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  p: 1,
                  bgcolor: "background.default",
                  borderRadius: 1,
                }}
              >
                <Chip
                  label={`${item.totalCount}`}
                  size="small"
                  color="primary"
                  sx={{ mt: 0.25 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    {item.itemName}
                    {item.notes && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {" "}
                        + {item.notes}
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.people.join(", ")}
                  </Typography>
                </Box>
                {item.maxQuantity !== null && (
                  <Chip
                    label={`${item.totalCount}/${item.maxQuantity}`}
                    size="small"
                    variant="outlined"
                    color={
                      item.totalCount >= item.maxQuantity ? "error" : "default"
                    }
                    sx={{ mt: 0.25 }}
                  />
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {personSummary.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                Không có người nào trong danh sách này
              </Typography>
            ) : (
              personSummary.map((person) => (
                <Box
                  key={person.personName}
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {person.personName}
                    {person.notes.length > 0 && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: "normal" }}
                      >
                        {" "}
                        ({person.notes.join(", ")})
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {person.selections
                      .map(
                        (s) =>
                          `${s.count} ${s.itemName}${s.notes ? ` + ${s.notes}` : ""}`,
                      )
                      .join(", ")}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
          onClick={handleCopy}
          disabled={itemSummary.length === 0}
          fullWidth
        >
          {copied ? "Đã copy!" : "Copy text"}
        </Button>
        {!isLocked && (
          <Button
            variant={isLocked ? "contained" : "outlined"}
            color={isLocked ? "error" : "primary"}
            startIcon={isLocked ? <LockIcon /> : <LockOpenIcon />}
            onClick={() => {
              if (isLocked) {
                onLockToggle();
              } else {
                setConfirmLockOpen(true);
              }
            }}
            disabled={isLocking || isLocked}
            fullWidth
          >
            Chốt đơn
          </Button>
        )}
      </Box>

      {/* Confirm Lock Dialog */}
      <Dialog
        open={confirmLockOpen}
        onClose={() => setConfirmLockOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Xác nhận chốt đơn
        </DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn chốt đơn hàng không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLockOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setConfirmLockOpen(false);
              onLockToggle();
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
