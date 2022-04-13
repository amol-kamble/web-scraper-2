```mermaid
flowchart TB
    zoho_sync-->record_payment
    make_payment-->send_to_razorpay
    subgraph Bill Module
    record_payment-->make_payment
    end
    subgraph Payment Module
    send_to_razorpay-->update_status
    end
    subgraph Zoho
    zoho_sync-->close_bill
    end
```
