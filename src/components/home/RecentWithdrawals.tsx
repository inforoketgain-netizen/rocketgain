import { forwardRef } from "react";
import { CheckCircle } from "lucide-react";

const withdrawals = [
  { user: "M***el R.", amount: 1250, time: "Il y a 5 min", method: "Bitcoin" },
  { user: "S***a K.", amount: 890, time: "Il y a 12 min", method: "PayPal" },
  { user: "J***n D.", amount: 3420, time: "Il y a 18 min", method: "Virement" },
  { user: "A***a M.", amount: 560, time: "Il y a 25 min", method: "Bitcoin" },
  { user: "T***s L.", amount: 2100, time: "Il y a 32 min", method: "PayPal" },
  { user: "E***a B.", amount: 780, time: "Il y a 45 min", method: "Virement" },
];

const RecentWithdrawals = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-up">
            Derniers <span className="text-gradient">retraits</span>
          </h2>
          <p className="text-muted-foreground animate-fade-up animation-delay-100">
            Des milliers d'utilisateurs retirent leurs gains chaque jour
          </p>
        </div>

        {/* Withdrawals List */}
        <div className="max-w-2xl mx-auto">
          <div className="space-y-3">
            {withdrawals.map((withdrawal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-background border border-border animate-slide-in-right"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{withdrawal.user}</p>
                    <p className="text-sm text-muted-foreground">{withdrawal.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary">
                    +${withdrawal.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{withdrawal.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

RecentWithdrawals.displayName = "RecentWithdrawals";

export default RecentWithdrawals;
