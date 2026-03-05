import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock, Send, ArrowRight, Loader2, CheckCircle } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const springConfig = { stiffness: 120, damping: 28, mass: 0.8 };

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: "", email: "", phone: "", message: "" },
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        try {
            // EXACT MATCH: Mapping frontend data to your Java LeadRequest variables
            await PrymeAPI.submitLead({
                name: data.name,
                email: data.email,
                mobile: data.phone,               // Maps form 'phone' to Java 'mobile'
                loanType: "GENERAL_INQUIRY",      // Satisfies the not-null constraint in DB
                message: data.message,            // Maps form 'message' to Java 'message'
            });

            setIsSuccess(true);
            toast({
                title: "Message Sent Successfully!",
                description: "Our team will get back to you shortly.",
            });
            form.reset();
        } catch (error: any) {
            toast({
                title: "Failed to send message",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactDetails = [
        { icon: Phone, title: "Phone", info: "+91 98765 43210", sub: "Mon-Sat, 9AM to 7PM" },
        { icon: Mail, title: "Email", info: "support@pryme.com", sub: "24/7 Online Support" },
        { icon: MapPin, title: "Office", info: "Pryme Headquarters", sub: "Sector 62, Noida, UP 201309" },
        { icon: Clock, title: "Working Hours", info: "9:00 AM - 7:00 PM", sub: "Sunday Closed" },
    ];

    return (
        <>
            <Helmet>
                <title>Contact Us - PYRME Consulting</title>
                <meta name="description" content="Get in touch with PYRME Consulting for your financial and loan needs." />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
                <Header />

                <main className="flex-1 pt-24 pb-16">
                    {/* Hero Section */}
                    <section className="aurora-gradient relative py-16 md:py-24 border-b border-border/50">
                        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...springConfig }}>
                <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wider mb-4 border border-primary/20">
                  SUPPORT & INQUIRIES
                </span>
                                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6" style={{ letterSpacing: "-0.02em" }}>
                                    Let's Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-trust">Conversation</span>
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    Whether you have a question about loan products, pricing, or anything else, our team is ready to answer all your questions.
                                </p>
                            </motion.div>
                        </div>
                    </section>

                    {/* Contact Content Split */}
                    <section className="py-16">
                        <div className="container mx-auto px-4 max-w-6xl">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

                                {/* Left Side: Contact Information */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: "spring", ...springConfig, delay: 0.1 }}
                                    className="lg:col-span-2 space-y-6"
                                >
                                    <h3 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                        {contactDetails.map((item, i) => (
                                            <div key={i} className="flex items-start gap-4 p-4 neo-card-inset rounded-2xl hover:border-primary/30 transition-colors duration-300 border border-transparent">
                                                <div className="w-12 h-12 rounded-full neo-card flex items-center justify-center shrink-0 text-primary">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{item.title}</p>
                                                    <p className="text-primary font-medium mt-0.5">{item.info}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Interactive Map Placeholder */}
                                    <div className="w-full h-48 rounded-2xl neo-card overflow-hidden relative group mt-8">
                                        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center backdrop-blur-[2px] transition-all group-hover:backdrop-blur-none">
                                            <Button variant="secondary" className="shadow-lg pointer-events-none">
                                                <MapPin className="w-4 h-4 mr-2 text-primary" /> View on Map
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Right Side: Contact Form */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", ...springConfig, delay: 0.2 }}
                                    className="lg:col-span-3"
                                >
                                    <div className="neo-card p-6 md:p-8 relative overflow-hidden">

                                        {isSuccess ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center py-16"
                                            >
                                                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <CheckCircle className="w-10 h-10 text-success" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-foreground mb-3">Request Received!</h3>
                                                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                                    Thank you for reaching out. One of our financial advisors will contact you at the provided phone number shortly.
                                                </p>
                                                <Button onClick={() => setIsSuccess(false)} variant="outline" className="neo-button">
                                                    Send Another Message
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-bold text-foreground">Send us a Message</h3>
                                                    <p className="text-sm text-muted-foreground">Fill out the form below and we'll get back to you within 24 hours.</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">Full Name</label>
                                                        <Input
                                                            placeholder="John Doe"
                                                            className={`neo-input border-0 bg-input ${form.formState.errors.name ? 'ring-2 ring-destructive' : ''}`}
                                                            {...form.register("name")}
                                                        />
                                                        {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">Phone Number</label>
                                                        <Input
                                                            placeholder="+91 98765 43210"
                                                            className={`neo-input border-0 bg-input ${form.formState.errors.phone ? 'ring-2 ring-destructive' : ''}`}
                                                            {...form.register("phone")}
                                                        />
                                                        {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">Email Address</label>
                                                    <Input
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        className={`neo-input border-0 bg-input ${form.formState.errors.email ? 'ring-2 ring-destructive' : ''}`}
                                                        {...form.register("email")}
                                                    />
                                                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">How can we help?</label>
                                                    <Textarea
                                                        placeholder="I'm looking for a personal loan of ₹5,00,000..."
                                                        className={`neo-input border-0 bg-input min-h-[150px] resize-none ${form.formState.errors.message ? 'ring-2 ring-destructive' : ''}`}
                                                        {...form.register("message")}
                                                    />
                                                    {form.formState.errors.message && <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>}
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full neo-button bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg group"
                                                >
                                                    {isSubmitting ? (
                                                        <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">Send Message <Send className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></span>
                                                    )}
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </motion.div>

                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default Contact;