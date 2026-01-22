'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userAPI } from '@/lib/api';
import { RoleGuard } from '@/components/role-guard';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function UserAuditPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = React.useState(true);
    const [logs, setLogs] = React.useState<any[]>([]);
    const [userName, setUserName] = React.useState('');

    const fetchAuditLogs = async () => {
        try {
            if (!params?.id) return;
            const userId = Number(params.id);
            // Currently generic user.read, later user.audit_view
            const res = await userAPI.getAuditLogs(userId);

            // Assuming backend returns { success: true, user: {...}, logs: [...] }
            // Adjust based on actual backend implementation in next step
            if (res.data.success) {
                setLogs(res.data.logs || []);
                setUserName(res.data.user?.name || 'User');
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
            // toast.error("Could not load audit logs");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAuditLogs();
    }, [params?.id]);

    return (
        <RoleGuard allowedRoles={['Admin']}>
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Audit Logs: {userName}</h1>
                            <p className="text-slate-500">Track user activity and system events.</p>
                        </div>
                        <Button variant="outline" onClick={() => router.back()}>Back to Users</Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                            <CardDescription>View recent actions performed by or on this user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="p-4 bg-slate-100 font-medium grid grid-cols-4">
                                    <span>Action</span>
                                    <span>Description</span>
                                    <span>IP Address</span>
                                    <span>Timestamp</span>
                                </div>
                                {logs.length === 0 && (
                                    <div className="p-8 text-center text-slate-500">
                                        No audit logs found for this user.
                                    </div>
                                )}
                                {logs.map((log, index) => (
                                    <div key={index} className="p-4 border-t grid grid-cols-4 items-center text-sm">
                                        <Badge variant="outline">{log.action || 'Unknown'}</Badge>
                                        <span className="truncate pr-4" title={log.description}>{log.description || '-'}</span>
                                        <span className="font-mono text-xs">{log.ip_address || '127.0.0.1'}</span>
                                        <span className="text-slate-500">
                                            {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RoleGuard>
    );
}
