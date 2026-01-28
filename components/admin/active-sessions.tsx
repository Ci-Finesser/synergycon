'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  LogOut,
  TriangleAlert,
  CheckCircle2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { SessionInfo } from '@/lib/session-tracker';

interface ActiveSessionsProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export default function ActiveSessions({
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: ActiveSessionsProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/sessions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  // Revoke a specific session
  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session? The device will be logged out.')) {
      return;
    }

    try {
      setRevoking(sessionId);
      const response = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke',
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }

      // Refresh sessions list
      await fetchSessions();
    } catch (err) {
      console.error('Error revoking session:', err);
      alert('Failed to revoke session');
    } finally {
      setRevoking(null);
    }
  };

  // Revoke all other sessions
  const handleRevokeAll = async () => {
    if (!confirm('Are you sure you want to log out all other devices? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_all',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke sessions');
      }

      // Refresh sessions list
      await fetchSessions();
    } catch (err) {
      console.error('Error revoking sessions:', err);
      alert('Failed to revoke sessions');
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchSessions();

    if (autoRefresh) {
      const interval = setInterval(fetchSessions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Get device icon
  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Loading session information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TriangleAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentSession = sessions.find((s) => s.is_current);
  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Sessions</h2>
          <p className="text-muted-foreground">
            Manage your login sessions across all devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {otherSessions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevokeAll}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out All Others
            </Button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Other Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{otherSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Current session */}
      {currentSession && (
        <Card className="border-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getDeviceIcon(currentSession.device_type)}
                <div>
                  <CardTitle className="text-lg">
                    {currentSession.device_name || 'Unknown Device'}
                  </CardTitle>
                  <CardDescription>Current session</CardDescription>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active Now
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last activity:</span>
                <span className="font-medium">
                  {formatDate(currentSession.last_activity)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Logged in:</span>
                <span className="font-medium">
                  {formatDate(currentSession.login_time)}
                </span>
              </div>
              {currentSession.ip_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">IP Address:</span>
                  <span className="font-medium font-mono text-xs">
                    {currentSession.ip_address}
                  </span>
                </div>
              )}
              {(currentSession.location_city || currentSession.location_country) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">
                    {[currentSession.location_city, currentSession.location_country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
              {currentSession.browser && currentSession.os && (
                <div className="text-xs text-muted-foreground">
                  {currentSession.browser} · {currentSession.os}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other sessions */}
      {otherSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Other Sessions</h3>
          {otherSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(session.device_type)}
                    <div>
                      <CardTitle className="text-lg">
                        {session.device_name || 'Unknown Device'}
                      </CardTitle>
                      <CardDescription>
                        {session.browser && session.os
                          ? `${session.browser} on ${session.os}`
                          : 'Unknown browser'}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={revoking === session.id}
                  >
                    {revoking === session.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last activity:</span>
                    <span className="font-medium">
                      {formatDate(session.last_activity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Logged in:</span>
                    <span className="font-medium">
                      {formatDate(session.login_time)}
                    </span>
                  </div>
                  {session.ip_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="font-medium font-mono text-xs">
                        {session.ip_address}
                      </span>
                    </div>
                  )}
                  {(session.location_city || session.location_country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">
                        {[session.location_city, session.location_country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active sessions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
