"use client"

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { roleAPI, userAPI } from '@/lib/api'
import { toast } from 'sonner'
import { User } from '@/components/user-management-table'

interface Role {
    id: number
    name: string
}

interface EditRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    onSuccess: () => void
}

export function EditRoleDialog({ open, onOpenChange, user, onSuccess }: EditRoleDialogProps) {
    const [roles, setRoles] = useState<Role[]>([])
    const [selectedRole, setSelectedRole] = useState<string>("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            fetchRoles()
            if (user && user.roles.length > 0) {
                setSelectedRole(user.roles[0].name)
            } else {
                setSelectedRole("User")
            }
        }
    }, [open, user])

    const fetchRoles = async () => {
        try {
            const res = await roleAPI.getAll()
            if (res.data.success) {
                setRoles(res.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch roles", error)
            toast.error("Failed to load roles")
        }
    }

    const handleSave = async () => {
        if (!user) return
        setLoading(true)
        try {
            const res = await userAPI.updateRole(user.id, selectedRole)
            if (res.data.success) {
                toast.success(res.data.message)
                onSuccess()
                onOpenChange(false)
            }
        } catch (error) {
            console.error("Failed to update role", error)
            toast.error("Failed to update user role")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User Role</DialogTitle>
                    <DialogDescription>
                        Change the role for {user?.name} ({user?.email}).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
