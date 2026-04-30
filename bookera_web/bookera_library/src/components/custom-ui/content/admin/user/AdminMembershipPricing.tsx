"use client";

import { useState, useEffect } from "react";
import { MembershipPlan, membershipService } from "@/services/membership.service";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Crown, Save, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminMembershipPricing() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<MembershipPlan>>({});
  const t = useTranslations("pricing");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await membershipService.getAdminPlans();
      setPlans(res.data.data);
    } catch (err) {
      toast.error(t("loadPlansError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditMode(Number(plan.id));
    setFormData(plan);
  };

  const handleCancel = () => {
    setEditMode(null);
    setFormData({});
  };

  const handleSave = async (id: number) => {
    setSaving(id);
    try {
      await membershipService.updateAdminPlan(id, formData);
      toast.success(t("updateSuccess"));
      setEditMode(null);
      fetchPlans();
    } catch (err) {
      toast.error(t("updateError"));
    } finally {
      setSaving(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-brand-primary/20 shadow-sm mb-6">
      <div className="bg-brand-primary/5 px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-brand-primary" />
            <CardTitle className="text-lg">{t("adminTitle")}</CardTitle>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md ml-1">
              Lifetime
            </span>
          </div>
          <CardDescription>
            {t("adminSubtitle")}
          </CardDescription>
        </div>
        {!editMode && plans.length > 0 && (
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => handleEdit(plans[0])}>
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            {t("editPrice")}
          </Button>
        )}
      </div>

      <CardContent className="p-6">
        <div className="w-full">
          {plans.map((plan) => {
            const isEditing = editMode === Number(plan.id);
            const isSaving = saving === Number(plan.id);

            if (isEditing) {
              return (
                <div key={plan.id} className="space-y-4 max-w-xl">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("packageName")}</Label>
                    <Input 
                      value={formData.name || ''} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("priceRp")}</Label>
                    <Input 
                      type="number"
                      value={formData.price || 0} 
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("shortDesc")}</Label>
                    <Textarea 
                      value={formData.description || ''} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="submit" size="sm" onClick={() => handleSave(Number(plan.id))} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                      {t("saveChanges")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                      {useTranslations("common")("cancel")}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div key={plan.id} className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("currentPrice")}</h3>
                  <p className="text-4xl font-black text-brand-primary">
                    {formatPrice(plan.price)}
                  </p>
                </div>
                <div className="pt-5 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("packageDesc")}</h3>
                  <p className="text-base text-foreground leading-relaxed max-w-3xl">
                    {plan.description}
                  </p>
                </div>
              </div>
            );
          })}
          
          {plans.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t("noData")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

