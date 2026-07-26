import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import Providers from "@/components/Providers";
import { AlertToastContainer } from "@/components/ui/AlertToast";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | xTred",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check — middleware handles redirects but this is belt+suspenders
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <Providers>
      <div className="dashboard-root">
        <Sidebar />
        <div className="dashboard-content">
          <main id="main-content" className="dashboard-main">
            {children}
          </main>
        </div>
      </div>
      <AlertToastContainer />

      <style>{`
        .dashboard-root {
          display: flex;
          min-height: 100dvh;
          background: var(--color-bg-base);
        }

        .dashboard-content {
          flex: 1;
          margin-left: var(--spacing-sidebar);
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .dashboard-main {
          flex: 1;
          padding: 1.5rem;
          max-width: 1600px;
        }
      `}</style>
    </Providers>
  );
}
