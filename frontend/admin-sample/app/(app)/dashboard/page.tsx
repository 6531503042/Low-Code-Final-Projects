'use client';

import type { UseruseSystem } from '@/types/user-stats';

import { useState, useEffect } from 'react';
import { Button, Chip, Select, SelectItem } from '@heroui/react';
import { LayoutDashboard, Users, FileText, AlertTriangle } from 'lucide-react';

import { ReportCharts } from './_components/DashboardReportCharts';
import Overview from './_components/DashboardOverview';
import FresherCheckinDashboard from './_components/FresherCheckinDashboard';
import AssessmentTable from './_components/AssessmentTable';
import CardStat from './_components/CardStat';

import { useCheckin } from '@/hooks/useCheckin';
import { useSponsors } from '@/hooks/useSponsors';
import { PageHeader } from '@/components/ui/page-header';
import { useEvoucher } from '@/hooks/useEvoucher';
import { useReports } from '@/hooks/useReports';
import { useReportTypes } from '@/hooks/useReportTypes';
import { useUserStatistics } from '@/hooks/useUsersytem';
import { useActivities } from '@/hooks/useActivities';
import ActivityTable from './_components/ActivityTable';
import PretestDetail from './_components/PretestDetail';
import ListActivities from './_components/ListActivities';
import { useAssessment } from '@/hooks/useAssessment';
import PosttestDetail from './_components/PosttestDetail';

export default function Dashboard() {
  const { activities } = useActivities({ autoFetch: true });
  const { assessments, assessmentLoading, fetchAssessment } = useAssessment();
  const { fetchCheckinByActivity } = useCheckin(null);
  const [allCheckins, setAllCheckins] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const combinedCheckins = Object.values(allCheckins).flat();
  const { sponsors } = useSponsors();
  const { evouchers } = useEvoucher();
  const { problems } = useReports();
  const { reporttypes } = useReportTypes();
  const { Userstats } = useUserStatistics();
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(undefined);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchAllCheckins() {
      if (activities.length === 0) return;
      setLoading(true);
      const result: Record<string, any[]> = {};

      for (const activity of activities) {
        const checkins = await fetchCheckinByActivity(activity._id);

        result[activity._id] = checkins || [];
      }

      setAllCheckins(result);
      setLoading(false);
    }

    fetchAllCheckins();
  }, [activities]);

  const countsByType = activities.reduce((acc, activity) => {
    const { type, name } = activity;

    if (!acc[type as string]) {
      acc[type as string] = new Set();
    }
    acc[type as string].add(name.en);

    return acc;
  }, {} as Record<string, Set<string>>);
  const activityStats = Object.entries(countsByType).filter(([type]) => !!type).map(([type, names]) => ({
    type,
    count: names.size,
  }));
  const handleDownloadCheckins = async (activityId: string, acronymPart: string) => {
    try {
      setDownloading(true); // start loading
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkins/activity/${activityId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch check-in data");

      const checkinData = await res.json();
      if (!checkinData || checkinData.length === 0) {
        alert("No check-ins found for this activity");
        return;
      }

      const activityName =
        checkinData[0]?.activity?.name?.en?.replace(/\s+/g, "_") || "activity";

      const headers = ["Username", "Name", "CheckinAt", "ActivityName"];

      const rows = checkinData.map((item) => {
        const username = item.user?.username ?? "";
        const fullName = `${item.user?.name?.first ?? ""} ${item.user?.name?.last ?? ""}`.trim();
        const checkinAt = new Date(item.createdAt).toLocaleString();
        const activityName = item.activity?.name?.en ?? "";
        return [username, fullName, checkinAt, activityName];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([`\uFEFF${csvContent}`], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `checkins_${activityName}_${acronymPart}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Error downloading check-in data");
    } finally {
      setDownloading(false); // stop loading
    }
  };




  return (
    <>
      <PageHeader
        description="System overview — quickly access key modules, recent activity, and system statistics."
        icon={<LayoutDashboard />}
      />

      <div className="h-fit w-full flex flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <Button color="primary" size="lg" variant="shadow">
          Export XLS
        </Button>
      </div>

      <div>
        <Overview
          Activities={activityStats}
          Evouchers={evouchers}
          Sponsors={sponsors}
          Userstats={Userstats ?? ({} as UseruseSystem)}
          checkin={combinedCheckins}
          isLoading={loading}
        />
      </div>
      <div className='space-y-6'>


        <CardStat colors='blue-100' icon={<FileText className="w-4 h-4" />} label="Activities Overview">
          <div className="flex flex-col gap-2 text-center w-full">
            <ActivityTable />
          </div>
        </CardStat>

        <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6'>
          <div className='col-span-2'>
            <CardStat colors='purple-100' icon={<FileText className="w-4 h-4" />} label="Pretest">
              <PretestDetail />
            </CardStat>
          </div>
          <div className='col-span-2'>
            <CardStat colors='purple-100' icon={<FileText className="w-4 h-4" />} label="Posttest">
              <PosttestDetail />
            </CardStat>
          </div>

          <div className='col-span-2'>
            <CardStat colors='purple-100' icon={<FileText className="w-4 h-4" />} label="Activities">
              <div className="flex flex-col gap-2 text-center w-full">
                <ListActivities
                  assessments={assessments.sort((a, b) => a.name.en.localeCompare(b.name.en))}
                  isLoading={assessmentLoading}
                  fetchAssessment={fetchAssessment}
                />
              </div>
            </CardStat>
          </div>
        </div>

        <CardStat
          colors="green-100"
          icon={<Users className="w-4 h-4" />}
          label="Download Check-ins by Activity"
        >
          <div className="flex items-center gap-4">
            <Select
              label="Select activity"
              placeholder="Choose an activity..."
              selectedKeys={selectedActivityId ? [selectedActivityId] : []}
              onSelectionChange={(keys) =>
                setSelectedActivityId(Array.from(keys)[0] as string)
              }
              variant="bordered"
              className="w-64"
            >
              {activities
                .sort((a, b) => a.name.en.localeCompare(b.name.en))
                .map((activity) => (
                  <SelectItem key={activity._id} textValue={activity.name.en}>
                    <div className="flex items-center gap-2">
                      {activity.acronym?.includes("-") && (
                        <Chip
                          radius="md"
                          className="h-6 bg-gray-200 text-gray-700"
                        >
                          {activity.acronym.split("-")[0]}
                        </Chip>
                      )}
                      <span>{activity.name.en}</span>
                    </div>
                  </SelectItem>
                ))}
            </Select>

            <Button
              size="md"
              color="primary"
              isDisabled={!selectedActivityId || downloading}
              isLoading={downloading}
              onPress={() => {
                if (selectedActivityId) {
                  const selectedActivity = activities.find(
                    (act) => act._id === selectedActivityId
                  );
                  const acronymPart = selectedActivity?.acronym
                    ?.split("-")[0]
                    ?.replace(/\s+/g, "_") || "";
                  handleDownloadCheckins(selectedActivityId, acronymPart);
                }
              }}
            >
              {downloading ? "Downloading..." : "Download"}
            </Button>
          </div>

        </CardStat>

        {/* 
        <CardStat colors='slate-100' icon={<FileText className="w-4 h-4" />} label="Activities Overview">
          <div className="flex flex-col gap-2 text-center w-full">
            <AssessmentTable />
          </div>
        </CardStat> */}

        <CardStat colors='red-100' icon={<AlertTriangle className="w-4 h-4" />} label="Reports Overview">
          <div className="flex flex-col gap-2 text-center w-full">
            <ReportCharts problems={problems} reporttypes={reporttypes} />
          </div>
        </CardStat>
      </div>
    </>
  );
}
