"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  LOCAL_DEMO_DB_UPDATED_EVENT,
  listModerationQueue,
  listModerationStats,
} from "@/lib/local-demo";
import type { ModerationQueueItem, ModerationReviewType } from "@/lib/local-demo";
import { SegmentedTabs } from "@/components/shared/segmented-tabs";
import { Clock, CheckCircle, XCircle, Eye, Shield } from "lucide-react";

function reviewTypeLabel(reviewType: ModerationReviewType): string {
  if (reviewType === "InitialSubmission") {
    return "Primera revision";
  }

  if (reviewType === "ReworkSubmission") {
    return "Correccion tras rechazo";
  }

  return "Sugerencia sobre publicado";
}

function reviewTypeVariant(
  reviewType: ModerationReviewType,
): "secondary" | "outline" | "default" {
  if (reviewType === "InitialSubmission") {
    return "secondary";
  }

  if (reviewType === "ReworkSubmission") {
    return "outline";
  }

  return "default";
}

function flowStateLabel(reviewType: ModerationReviewType): string {
  if (reviewType === "InitialSubmission") {
    return "Primera publicacion pendiente";
  }

  if (reviewType === "ReworkSubmission") {
    return "Reenvio tras feedback de rechazo";
  }

  return "Version publicada sigue activa";
}

function ModerationCard({ item }: { item: ModerationQueueItem }) {
  const initials = item.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const submittedDate = new Date(item.submittedAt);
  const timeAgo = getTimeAgo(submittedDate);

  return (
    <Card className="border-border/70 bg-card/80 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {item.reviewType === "InitialSubmission" ? "Nuevo" : "Edicion"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {flowStateLabel(item.reviewType)}
              </Badge>
              <Badge variant={reviewTypeVariant(item.reviewType)} className="text-xs">
                {reviewTypeLabel(item.reviewType)}
              </Badge>
            </div>
            <Badge
              variant={item.type === "SuccessCase" ? "default" : "secondary"}
            >
              {item.type === "SuccessCase" ? "Caso de Exito" : "Testimonio"}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.body}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={item.authorName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{item.authorName}</p>
              <p className="text-xs text-muted-foreground">{item.authorRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/moderation/${item.testimonyId}`}>
                <Eye className="mr-1 h-4 w-4" />
                Revisar
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `Hace ${diffDays}d`;
}

export default function ModerationPage() {
  const [pendingReviews, setPendingReviews] = useState<ModerationQueueItem[]>(
    [],
  );
  const [approvedToday, setApprovedToday] = useState(0);
  const [rejectedToday, setRejectedToday] = useState(0);

  useEffect(() => {
    const load = () => {
      setPendingReviews(listModerationQueue());
      const stats = listModerationStats();
      setApprovedToday(stats.approvedToday);
      setRejectedToday(stats.rejectedToday);
    };

    load();
    window.addEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);

    return () => {
      window.removeEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);
    };
  }, []);

  const isEmpty = pendingReviews.length === 0;

  const grouped = useMemo(() => {
    const initial = pendingReviews.filter(
      (item) => item.reviewType === "InitialSubmission",
    );
    const rework = pendingReviews.filter(
      (item) => item.reviewType === "ReworkSubmission",
    );
    const suggestion = pendingReviews.filter(
      (item) => item.reviewType === "PublishedSuggestion",
    );

    return {
      initial,
      rework,
      suggestion,
    };
  }, [pendingReviews]);

  const renderGrid = (items: ModerationQueueItem[]) => {
    if (items.length === 0) {
      return (
        <Card className="border-border/70 bg-card/80">
          <CardContent className="py-10 text-center text-muted-foreground">
            No hay elementos para este tipo de revision.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ModerationCard key={item.shadowCopyId} item={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cola de Moderacion"
        description="Prioriza revisiones por contexto y decide con feedback claro"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingReviews.length}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedToday}</p>
              <p className="text-sm text-muted-foreground">Aprobados hoy</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rejectedToday}</p>
              <p className="text-sm text-muted-foreground">Rechazados hoy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<Shield className="h-6 w-6 text-muted-foreground" />}
          title="No hay testimonios pendientes"
          description="Todos los testimonios han sido revisados. Buen trabajo."
        />
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <SegmentedTabs
            size="sm"
            className="pb-1"
            listClassName="max-w-full"
            items={[
              { value: "all", label: "Todo", count: pendingReviews.length },
              {
                value: "initial",
                label: "Primera revision",
                count: grouped.initial.length,
              },
              {
                value: "rework",
                label: "Correcciones",
                count: grouped.rework.length,
              },
              {
                value: "suggestion",
                label: "Sugerencias publicadas",
                count: grouped.suggestion.length,
              },
            ]}
          />

          <TabsContent value="all" className="mt-0">
            {renderGrid(pendingReviews)}
          </TabsContent>

          <TabsContent value="initial" className="mt-0">
            {renderGrid(grouped.initial)}
          </TabsContent>

          <TabsContent value="rework" className="mt-0">
            {renderGrid(grouped.rework)}
          </TabsContent>

          <TabsContent value="suggestion" className="mt-0">
            {renderGrid(grouped.suggestion)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
