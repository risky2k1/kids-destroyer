'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Star, Tags, Text } from 'lucide-react';
import { Chips, RecordTable } from '@/core/ui/RecordTable';
import {
  PLACES_PATHS,
  STATUS_LABELS,
  TagIcon,
  formatOpeningHours,
  formatRatingSummary,
  isApprovedPlace,
  isOpenAt,
  nowMinutesInVietnam,
  originLabel,
  primaryCategoryTag,
  type Place,
  type PlaceStatus,
  type Tag,
} from '@/plugins/places/shared';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Checkbox } from '@/themes/neobrutal/ui/checkbox';
import { PlaceRowActions } from './PlaceRowActions';

type StatusTab = 'all' | PlaceStatus | 'pending';

const formatDate = (d: string) => d.split('-').reverse().join('/');

export function PlacesTable({
  places,
  tags,
  initialNowMinute,
}: {
  places: Place[];
  tags: Tag[];
  initialNowMinute: number;
}) {
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [openNow, setOpenNow] = useState(false);
  const [nowMinute, setNowMinute] = useState(initialNowMinute);

  const tagsById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);
  const approved = useMemo(() => places.filter(isApprovedPlace), [places]);
  const pendingPlaces = useMemo(() => places.filter((p) => !isApprovedPlace(p)), [places]);
  const activeTab: StatusTab =
    statusTab === 'pending' && pendingPlaces.length === 0 ? 'all' : statusTab;
  const tabs: { id: StatusTab; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'visited', label: STATUS_LABELS.visited },
    { id: 'wishlist', label: STATUS_LABELS.wishlist },
  ];
  if (pendingPlaces.length > 0) tabs.push({ id: 'pending', label: 'Chờ duyệt' });
  const rows = useMemo(() => {
    if (activeTab === 'pending') return pendingPlaces;
    return activeTab === 'all' ? approved : approved.filter((p) => p.status === activeTab);
  }, [activeTab, approved, pendingPlaces]);

  return (
    <RecordTable
      view={{
        label: 'quán',
        actions: (
          <div role="tablist" className="mr-1 flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setStatusTab(t.id)}
                className="rounded-base border border-border/20 px-2 py-0.5 text-xs aria-selected:border-border aria-selected:bg-main aria-selected:font-heading aria-selected:text-main-foreground"
              >
                {t.label}
              </button>
            ))}
          </div>
        ),
        extraFilter: {
          activeCount: openNow ? 1 : 0,
          match: (p) => !openNow || isOpenAt(p.openHours, nowMinute),
          onReset: () => setOpenNow(false),
          content: (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={openNow}
                onCheckedChange={(checked) => {
                  if (checked) setNowMinute(nowMinutesInVietnam());
                  setOpenNow(checked);
                }}
              />
              <span>Đang mở cửa lúc này</span>
            </label>
          ),
        },
      }}
      columns={[
        {
          key: 'name',
          label: 'Quán',
          icon: Text,
          sortValue: (p) => p.name,
          filterValue: (p) => [p.name, p.dishes ?? ''],
          render: (p) => (
            <span className="inline-flex flex-wrap items-center gap-1.5 font-heading">
              <TagIcon tag={primaryCategoryTag(p, tagsById)} fallbackPin className="size-4" />
              {p.name}
              <Badge variant="neutral">{originLabel(p.origin, p.reviewStatus)}</Badge>
            </span>
          ),
        },
        {
          key: 'status',
          label: 'Trạng thái',
          icon: Clock,
          sortValue: (p) => STATUS_LABELS[p.status],
          filterValue: (p) => STATUS_LABELS[p.status],
          filterFacet: true,
          render: (p) => (
            <Badge variant={p.status === 'wishlist' ? 'neutral' : 'default'}>
              {STATUS_LABELS[p.status]}
            </Badge>
          ),
        },
        {
          key: 'rating',
          label: 'Đánh giá',
          icon: Star,
          sortValue: (p) => (p.status === 'wishlist' ? null : p.rating),
          render: (p) =>
            p.status === 'wishlist' ? '—' : formatRatingSummary(p.rating, p.visitCount),
        },
        {
          key: 'category',
          label: 'Loại quán',
          icon: Tags,
          filterValue: (p) =>
            p.categoryIds.map((id) => tagsById.get(id)?.name ?? '').filter(Boolean),
          filterFacet: true,
          render: (p) => {
            const items = p.categoryIds
              .map((id) => tagsById.get(id)?.name)
              .filter((n): n is string => Boolean(n));
            return items.length > 0 ? <Chips items={items} /> : '—';
          },
        },
        {
          key: 'area',
          label: 'Khu vực',
          icon: MapPin,
          sortValue: (p) => (p.areaId ? tagsById.get(p.areaId)?.name : null),
          filterValue: (p) => (p.areaId ? tagsById.get(p.areaId)?.name : null),
          filterFacet: true,
          render: (p) => (p.areaId ? tagsById.get(p.areaId)?.name : null) ?? '—',
        },
        {
          key: 'hours',
          label: 'Giờ mở',
          icon: Clock,
          sortValue: (p) => formatOpeningHours(p.openHours),
          render: (p) => formatOpeningHours(p.openHours) || '—',
        },
        {
          key: 'visitedOn',
          label: 'Đi gần nhất',
          icon: Calendar,
          sortValue: (p) => p.visitedOn,
          render: (p) => (p.visitedOn ? formatDate(p.visitedOn) : '—'),
        },
        {
          key: 'actions',
          label: '',
          icon: Clock,
          render: (p) => (
            <PlaceRowActions id={p.id} name={p.name} pendingReview={!isApprovedPlace(p)} />
          ),
        },
      ]}
      rows={rows}
      getId={(p) => p.id}
      getHref={(p) => PLACES_PATHS.edit(p.id)}
      empty="Không có quán nào khớp."
      addRow={
        <Link href={PLACES_PATHS.new} className="text-[13px] text-foreground/60">
          + Thêm quán
        </Link>
      }
    />
  );
}
