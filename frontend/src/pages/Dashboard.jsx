// Displays server-generated KPI analytics and Recharts visualizations with RTK Query polling.
import React, { useMemo } from "react";
import { Alert, Box, Card, CardContent, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import StatCard from "../components/StatCard";
import { useGetDashboardStatsQuery } from "../features/api/apiSlice";

export default function Dashboard() {
  const { data, isLoading, isError } = useGetDashboardStatsQuery();

  const stats = data?.data;
  const roleData = useMemo(function () {
    return (stats?.roleDistribution || []).map(function (item) {
      return { name: item._id, value: item.count };
    });
  }, [stats?.roleDistribution]);

  const trendData = useMemo(function () {
    return stats?.eventTrend || [];
  }, [stats?.eventTrend]);

  if (isLoading) return <LinearProgress />;
  if (isError) return <Alert severity="error">Unable to load dashboard analytics.</Alert>;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Overview</Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.7 }}>A live view of your workspace performance.</Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total users" value={stats?.users?.totalUsers || 0} subtitle="All visible accounts" icon={<PeopleRoundedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Active users" value={stats?.users?.activeUsers || 0} subtitle="Currently enabled" icon={<CheckCircleRoundedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total events" value={stats?.events?.totalEvents || 0} subtitle="Across your workspace" icon={<EventRoundedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Scheduled" value={stats?.events?.scheduled || 0} subtitle="Upcoming activity" icon={<DonutLargeRoundedIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: 390 }}>
            <CardContent sx={{ p: 3, height: "100%", boxSizing: "border-box" }}>
              <Typography sx={{ fontWeight: 800 }}>Users by role</Typography>
              <Box sx={{ height: 310, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {roleData.map(function (entry, index) {
                        return <Cell key={`${entry.name}-${index}`} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ height: 390 }}>
            <CardContent sx={{ p: 3, height: "100%", boxSizing: "border-box" }}>
              <Typography sx={{ fontWeight: 800 }}>Event activity</Typography>
              <Box sx={{ height: 310, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
