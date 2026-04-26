"use client";

import styles from "./Home.module.sass";
import Bento from "@/components/Bento";

const HomePage = () => {
    return (
        <div className={styles.outer}>
            <Bento
                title="Customer Feedback"
                content="Implement user-driven rating system to showcase product quality."
                image="/images/star-rating.png"
            ></Bento>
            <Bento
                title="Smart Wallet"
                content="Securely store and manage digital assets and payment methods."
                image="/images/wallet.png"
            ></Bento>
            <Bento
                title="Product Dashboard"
                content="Provide comprehensive insights with real-time data visualization."
                image="/images/dashboard.png"
            ></Bento>
            <Bento
                title="Secure Payment"
                content="Implement encrypted transactions with multi-layer security protocols."
                image="/images/credit-card.png"
            ></Bento>
            <Bento
                title="Flash Sales"
                content="Boost sales with time-limited offers and lightning-fast promotions."
                image="/images/lightning-bolt.png"
            ></Bento>
            <Bento
                title="Limited Special Offer"
                content="Implement dynamic pricing system for targeted promotional offers."
                image="/images/special-offer.png"
            ></Bento>
            <Bento
                title="Secure Login"
                content="Protect accounts with advanced authentication and encryption."
                image="/images/fingerprint.png"
            ></Bento>
            <Bento
                title="Shopping Cart"
                content="Enable seamless item selection with real-time cart management."
                image="/images/shopping-cart.png"
            ></Bento>
            <Bento
                title="Instant Access"
                content="Enable rapid file delivery with secure download infrastructure."
                image="/images/digital-download.png"
            ></Bento>
            <Bento
                title="Product Search"
                content="Implement AI-powered search algorithm for precise result matching."
                image="/images/product-search.png"
            ></Bento>
            <Bento
                title="Save for Later"
                content="Implement user-specific product bookmarking with sync capabilities."
                image="/images/wishlist.png"
            ></Bento>
            <Bento
                title="International Shipping"
                content="Implement multi-region support with automated tax and duty calculation."
                image="/images/international-shipping.png"
            ></Bento>
            <Bento
                title="Mobile Shopping"
                content="Optimize user experience with responsive design and mobile APIs."
                image="/images/mobile-shopping.png"
            ></Bento>
            <Bento
                title="Money-Back Guarantee"
                content="Automate refund processes with configurable policy enforcement."
                image="/images/money-back.png"
            ></Bento>
            <Bento
                title="Customer Support"
                content="Deploy AI-powered chatbots with seamless human agent integration."
                image="/images/message.png"
            ></Bento>
            <Bento
                title="Promo Code"
                content="Implement dynamic discount system with customizable code generation."
                image="/images/coupon.png"
            ></Bento>
            <Bento
                title="Earn Rewards"
                content="Implement tiered reward system with automated point calculation."
                image="/images/earn-rewards.png"
            ></Bento>
            <Bento
                title="Real-Time Tracking"
                content="Integrate multi-carrier APIs for live shipment status and updates."
                image="/images/realtime-tracking.png"
            ></Bento>
            <Bento
                title="Special Discount"
                content="Unlock personalized discount codes for enhanced shopping experience."
                image="/images/special-discount.png"
            ></Bento>
            <Bento
                title="Sales Analytics"
                content="Visualize revenue trends with AI-powered sales forecasting tools."
                image="/images/sales-analytics.png"
            ></Bento>
            <Bento
                title="Smart Savings"
                content="Access AI-curated deals and personalized savings recommendations."
                image="/images/smart-savings.png"
            ></Bento>
            <Bento
                title="Instant Shop"
                content="Enable rapid product access via dynamic QR code generation system."
                image="/images/qr-code.png"
            ></Bento>
            <Bento
                title="User Authentication"
                content="Implement multi-factor authentication for enhanced account security."
                image="/images/user-authentication.png"
            ></Bento>
            <Bento
                title="License Hub"
                content="Centralize digital rights management with secure access controls."
                image="/images/license-hub.png"
            ></Bento>
            <Bento
                title="Digital Inventory"
                content="Streamline product cataloging with automated metadata management."
                image="/images/digital-inventory.png"
            ></Bento>
            <Bento
                title="Multi-Currency Support"
                content="Integrate a payment method that supports multiple currencies."
                image="/images/multi-currency-support.png"
            ></Bento>
            <Bento
                title="Affiliate Network"
                content="Deploy automated referral tracking and multi-tier commission system."
                image="/images/affiliate-network.png"
            ></Bento>
            <Bento
                title="Smart Recommendations"
                content="Implement AI-driven algorithms for personalized product suggestions."
                image="/images/smart-recommendation.png"
            ></Bento>
            <Bento
                title="Product Ecosystem"
                content="Unify product data across inventory, sales, and fulfillment systems."
                image="/images/product-ecosystem.png"
            ></Bento>
            <Bento
                title="Product Onboarding"
                content="Automate product ingestion with AI-powered data enrichment tools."
                image="/images/product-onboarding.png"
            ></Bento>
        </div>
    );
};

export default HomePage;
