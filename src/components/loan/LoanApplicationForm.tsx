import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Briefcase, CheckCircle, XCircle, Lock, ArrowRight, MapPin, CreditCard, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Validation schemas
const applicationSchema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters").max(100),
    dob: z.string().min(1, "Date of birth is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    monthlyIncome: z.number().min(15000, "Minimum income is ₹15,000"),
    occupation: z.enum(["salaried", "business"], { required_error: "Select occupation type" }),
    cibilScore: z.number().min(300, "CIBIL score must be between 300-900").max(900, "CIBIL score must be between 300-900"),
    loanAmount: z.number().min(100000, "Minimum loan amount is ₹1,00,000").max(10000000, "Maximum loan amount is ₹1,00,00,000"),
    loanTenure: z.number().min(1, "Minimum tenure is 1 year").max(30, "Maximum tenure is 30 years"),
    productType: z.string().min(1, "Product type is required"),
});

type ApplicationData = z.infer<typeof applicationSchema>;

interface LoanApplicationFormProps {
    onAmountChange?: (amount: number) => void;
    onFormSubmit?: (data: ApplicationData) => void;
}

const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const productTypes = [
    { value: "personal", label: "Personal Loan" },
    { value: "home", label: "Home Loan" },
    { value: "business", label: "Business Loan" },
    { value: "car", label: "Car Loan" },
    { value: "education", label: "Education Loan" },
    { value: "gold", label: "Gold Loan" },
    { value: "lap", label: "Loan Against Property" },
];

// FIXED: Moved outside the main component and wrapped in forwardRef
// so React Hook Form can track it and it doesn't remount on every keystroke.
interface InputWithValidationProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    isValid?: boolean;
    isSecure?: boolean;
}

const InputWithValidation = React.forwardRef<HTMLInputElement, InputWithValidationProps>(
    ({ label, error, isValid, isSecure, className, ...props }, ref) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">{label}</Label>
            <div className="relative">
                <Input
                    ref={ref}
                    {...props}
                    className={cn(
                        "pr-10 neo-input border-0 bg-input text-foreground placeholder:text-muted-foreground",
                        error && "ring-2 ring-destructive",
                        isValid && "ring-2 ring-success",
                        className
                    )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isSecure && <Lock className="w-4 h-4 text-muted-foreground" />}
                    {error && <XCircle className="w-4 h-4 text-destructive" />}
                    {isValid && !error && <CheckCircle className="w-4 h-4 text-success" />}
                </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
);
InputWithValidation.displayName = "InputWithValidation";

const LoanApplicationForm = ({ onAmountChange, onFormSubmit }: LoanApplicationFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cibilValue, setCibilValue] = useState(700);

    const form = useForm<ApplicationData>({
        resolver: zodResolver(applicationSchema),
        mode: "onChange",
        // Set all default values so they start as controlled inputs
        defaultValues: {
            fullName: "",
            dob: "",
            city: "",
            state: "",
            occupation: undefined,
            productType: "",
            monthlyIncome: 50000,
            loanAmount: 500000,
            loanTenure: 5,
            cibilScore: 700,
        },
    });

    const handleSubmit = async (data: ApplicationData) => {
        setIsSubmitting(true);
        // Simulate initial processing delay before showing comparisons
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitting(false);

        toast({
            title: "Details Verified",
            description: "Fetching best loan offers from our partners...",
        });

        onFormSubmit?.(data);
    };

    const getCibilColor = (score: number) => {
        if (score >= 750) return "text-success";
        if (score >= 650) return "text-trust";
        if (score >= 550) return "text-primary";
        return "text-destructive";
    };

    const getCibilLabel = (score: number) => {
        if (score >= 750) return "Excellent";
        if (score >= 650) return "Good";
        if (score >= 550) return "Fair";
        return "Poor";
    };

    return (
        <div className="neo-card p-6 md:p-8">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {/* Section 1: Personal Details */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Personal Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputWithValidation
                            label="Full Name"
                            placeholder="Enter your full name"
                            isSecure
                            isValid={form.formState.dirtyFields.fullName && !form.formState.errors.fullName}
                            error={form.formState.errors.fullName?.message}
                            {...form.register("fullName")}
                        />

                        <InputWithValidation
                            label="Date of Birth"
                            type="date"
                            isSecure
                            isValid={form.formState.dirtyFields.dob && !form.formState.errors.dob}
                            error={form.formState.errors.dob?.message}
                            {...form.register("dob")}
                        />
                    </div>
                </div>

                {/* Section 2: Location */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Location</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">State</Label>
                            <Select
                                value={form.watch("state")}
                                onValueChange={(v) => form.setValue("state", v, { shouldValidate: true })}
                            >
                                <SelectTrigger className={cn("neo-input border-0 bg-input text-foreground", form.formState.errors.state && "ring-2 ring-destructive")}>
                                    <SelectValue placeholder="Select State" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {states.map((state) => (
                                        <SelectItem key={state} value={state}>{state}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.state && (
                                <p className="text-xs text-destructive">{form.formState.errors.state.message}</p>
                            )}
                        </div>

                        <InputWithValidation
                            label="City"
                            placeholder="Enter your city"
                            isValid={form.formState.dirtyFields.city && !form.formState.errors.city}
                            error={form.formState.errors.city?.message}
                            {...form.register("city")}
                        />
                    </div>
                </div>

                {/* Section 3: Occupation & Income */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Occupation & Income</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Occupation Type</Label>
                            <Select
                                value={form.watch("occupation")}
                                onValueChange={(v) => form.setValue("occupation", v as "salaried" | "business", { shouldValidate: true })}
                            >
                                <SelectTrigger className={cn("neo-input border-0 bg-input text-foreground", form.formState.errors.occupation && "ring-2 ring-destructive")}>
                                    <SelectValue placeholder="Select occupation" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="salaried">Salaried</SelectItem>
                                    <SelectItem value="business">Business Person</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.occupation && (
                                <p className="text-xs text-destructive">{form.formState.errors.occupation.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Monthly Income (₹)</Label>
                            <Input
                                type="number"
                                placeholder="50000"
                                className={cn("neo-input border-0 bg-input text-foreground placeholder:text-muted-foreground", form.formState.errors.monthlyIncome && "ring-2 ring-destructive")}
                                {...form.register("monthlyIncome", { valueAsNumber: true })}
                            />
                            {form.formState.errors.monthlyIncome && (
                                <p className="text-xs text-destructive">{form.formState.errors.monthlyIncome.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 4: CIBIL Self Declaration */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">CIBIL Score (Self Declared)</h3>
                    </div>

                    <div className="neo-card-inset p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-muted-foreground">Your CIBIL Score</span>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-2xl font-bold", getCibilColor(cibilValue))}>{cibilValue}</span>
                                <span className={cn("text-sm font-medium px-2 py-1 rounded-lg bg-muted", getCibilColor(cibilValue))}>
                  {getCibilLabel(cibilValue)}
                </span>
                            </div>
                        </div>
                        <Slider
                            value={[cibilValue]}
                            onValueChange={(v) => {
                                setCibilValue(v[0]);
                                form.setValue("cibilScore", v[0], { shouldValidate: true });
                            }}
                            min={300}
                            max={900}
                            step={10}
                            className="cursor-pointer"
                        />
                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-muted-foreground">300 (Poor)</span>
                            <span className="text-xs text-muted-foreground">900 (Excellent)</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            💡 Don't know your CIBIL score? Check it free at <a href="https://www.cibil.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">cibil.com</a>
                        </p>
                    </div>
                </div>

                {/* Section 5: Loan Requirements */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Loan Requirements</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Product Type</Label>
                            <Select
                                value={form.watch("productType")}
                                onValueChange={(v) => form.setValue("productType", v, { shouldValidate: true })}
                            >
                                <SelectTrigger className={cn("neo-input border-0 bg-input text-foreground", form.formState.errors.productType && "ring-2 ring-destructive")}>
                                    <SelectValue placeholder="Select loan type" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {productTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.productType && (
                                <p className="text-xs text-destructive">{form.formState.errors.productType.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Loan Amount (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="500000"
                                    className={cn("neo-input border-0 bg-input text-foreground placeholder:text-muted-foreground", form.formState.errors.loanAmount && "ring-2 ring-destructive")}
                                    {...form.register("loanAmount", {
                                        valueAsNumber: true,
                                        onChange: (e) => onAmountChange?.(parseInt(e.target.value) || 0)
                                    })}
                                />
                                {form.formState.errors.loanAmount && (
                                    <p className="text-xs text-destructive">{form.formState.errors.loanAmount.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Loan Tenure (Years)</Label>
                                <Select
                                    value={form.watch("loanTenure")?.toString()}
                                    onValueChange={(v) => form.setValue("loanTenure", parseInt(v), { shouldValidate: true })}
                                >
                                    <SelectTrigger className={cn("neo-input border-0 bg-input text-foreground", form.formState.errors.loanTenure && "ring-2 ring-destructive")}>
                                        <SelectValue placeholder="Select tenure" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {[1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30].map((year) => (
                                            <SelectItem key={year} value={year.toString()}>{year} {year === 1 ? 'Year' : 'Years'}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.loanTenure && (
                                    <p className="text-xs text-destructive">{form.formState.errors.loanTenure.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full neo-button bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
                    size="lg"
                >
                    {isSubmitting ? "Processing..." : "Compare Loan Offers"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Security Footer */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4">
                    <Lock className="w-3 h-3" />
                    <span>Your data is encrypted with 256-bit SSL and processed securely</span>
                </div>
            </form>
        </div>
    );
};

export default LoanApplicationForm;