using NarayanaTravels.Core.Dtos;
using NarayanaTravels.Core.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace NarayanaTravels.Infrastructure.Services;

public class InvoicePdfService
{
    private static readonly string NavyBlue = "#0B2447";
    private static readonly string RoyalBlue = "#19376D";
    private static readonly string Gold = "#C9A227";
    private static readonly string LightGrey = "#F4F5F7";
    private static readonly string DarkGrey = "#4A4A4A";

    private static readonly byte[]? LogoBytes = LoadLogoBytes();

    private static byte[]? LoadLogoBytes()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Assets", "narayana-logo.png");
        return File.Exists(path) ? File.ReadAllBytes(path) : null;
    }

    public byte[] GenerateInvoicePdf(BillDto bill)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontFamily("Lato").FontSize(10).FontColor(DarkGrey));

                page.Header().Element(c => ComposeHeader(c, bill));
                page.Content().Element(c => ComposeContent(c, bill));
                page.Footer().Element(ComposeFooter);
            });
        });

        return doc.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, BillDto bill)
    {
        container.Background(NavyBlue).Padding(20).Row(row =>
        {
            row.RelativeItem().Column(col =>
            {
                col.Item().Text("NARAYANA TRAVELS").FontSize(22).Bold().FontColor(Colors.White);
                col.Item().PaddingTop(2).Text("Travel Invoice").FontSize(11).FontColor(Gold);
                col.Item().PaddingTop(6).Text("www.narayanatravels.com  |  +91-00000-00000").FontSize(8).FontColor(Colors.White);
            });

            row.ConstantItem(60).AlignRight().AlignMiddle().Column(col =>
            {
                var logoBox = col.Item().AlignCenter().Width(52).Height(52).Background(Colors.White).Padding(4);
                if (LogoBytes != null)
                {
                    logoBox.Image(LogoBytes).FitArea();
                }
                else
                {
                    logoBox.AlignMiddle().AlignCenter().Svg(BuildChakraSvg());
                }
            });
        });
    }

    private static string BuildChakraSvg()
    {
        const double cx = 50, cy = 50;
        const int rimPetals = 20, dots = 28, outerLotusPetals = 12, innerLotusPetals = 12;

        static double Rad(double deg) => deg * Math.PI / 180.0;

        var sb = new System.Text.StringBuilder();
        sb.Append("<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">");
        sb.Append("<defs><linearGradient id=\"g\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">");
        sb.Append("<stop offset=\"0%\" stop-color=\"#F0C339\"/><stop offset=\"55%\" stop-color=\"#D98E1E\"/><stop offset=\"100%\" stop-color=\"#C0501F\"/>");
        sb.Append("</linearGradient></defs>");

        sb.Append("<g stroke=\"url(#g)\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">");
        sb.Append($"<circle cx=\"{cx}\" cy=\"{cy}\" r=\"45\" stroke-width=\"1.6\"/>");

        for (var i = 0; i < rimPetals; i++)
        {
            var angle = i * 360.0 / rimPetals;
            sb.Append($"<path d=\"M50 3 L52.6 10.5 L50 8.4 L47.4 10.5 Z\" stroke-width=\"1\" transform=\"rotate({angle:0.###} 50 50)\"/>");
        }

        sb.Append("<path d=\"M9 50 C 6 46, 6 41, 10 39 C 7 42, 8 46, 12 47 C 9 44, 10 40, 14 40 C 10 42, 11 47, 16 48\" stroke-width=\"1.1\"/>");
        sb.Append("<path d=\"M91 50 C 94 46, 94 41, 90 39 C 93 42, 92 46, 88 47 C 91 44, 90 40, 86 40 C 90 42, 89 47, 84 48\" stroke-width=\"1.1\"/>");

        for (var i = 0; i < outerLotusPetals; i++)
        {
            var angle = i * 360.0 / outerLotusPetals;
            sb.Append($"<path d=\"M50 50 Q45 37 50 27 Q55 37 50 50 Z\" stroke-width=\"1.2\" transform=\"rotate({angle:0.###} 50 50)\"/>");
        }

        for (var i = 0; i < innerLotusPetals; i++)
        {
            var angle = i * 360.0 / innerLotusPetals + 15;
            sb.Append($"<path d=\"M50 50 Q46.5 41 50 34 Q53.5 41 50 50 Z\" stroke-width=\"1\" transform=\"rotate({angle:0.###} 50 50)\"/>");
        }

        sb.Append($"<circle cx=\"{cx}\" cy=\"{cy}\" r=\"3\" stroke-width=\"1.4\"/>");
        sb.Append("</g>");

        sb.Append("<g fill=\"url(#g)\">");
        for (var i = 0; i < dots; i++)
        {
            var angle = Rad(i * 360.0 / dots);
            var x = cx + 34 * Math.Cos(angle);
            var y = cy + 34 * Math.Sin(angle);
            sb.Append($"<circle cx=\"{x:0.###}\" cy=\"{y:0.###}\" r=\"1.3\"/>");
        }
        sb.Append("</g>");

        sb.Append("</svg>");
        return sb.ToString();
    }

    private void ComposeContent(IContainer container, BillDto bill)
    {
        container.PaddingTop(15).Column(col =>
        {
            // Invoice meta + status
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text(t =>
                    {
                        t.Span("Invoice No: ").SemiBold();
                        t.Span(bill.InvoiceNumber).FontColor(RoyalBlue).Bold();
                    });
                    c.Item().Text(t =>
                    {
                        t.Span("Invoice Date: ").SemiBold();
                        t.Span(bill.InvoiceDate.ToString("dd MMM yyyy"));
                    });
                });

                row.ConstantItem(140).AlignRight().Element(e =>
                {
                    var (bg, label) = StatusStyle(bill.PaymentStatus);
                    e.Background(bg).Padding(6).AlignCenter().Text(label).FontColor(Colors.White).Bold().FontSize(10);
                });
            });

            col.Item().PaddingTop(12).Row(row =>
            {
                row.RelativeItem().Background(LightGrey).Padding(10).Column(c =>
                {
                    c.Item().Text("Bill To").Bold().FontColor(RoyalBlue);
                    c.Item().PaddingTop(3).Text(bill.CustomerName).Bold();
                    c.Item().Text(bill.MobileNumber);
                    if (!string.IsNullOrWhiteSpace(bill.Email)) c.Item().Text(bill.Email!);
                    if (!string.IsNullOrWhiteSpace(bill.Address)) c.Item().Text(bill.Address!);
                });

                row.ConstantItem(10);

                row.RelativeItem().Background(LightGrey).Padding(10).Column(c =>
                {
                    c.Item().Text("Journey Details").Bold().FontColor(RoyalBlue);
                    c.Item().PaddingTop(3).Row(r =>
                    {
                        r.AutoItem().Text(bill.From).Bold();
                        r.RelativeItem().AlignCenter().Text("---->").FontColor(Gold);
                        r.AutoItem().Text(bill.To).Bold();
                    });
                    c.Item().PaddingTop(3).Text($"Travel Date: {bill.TravelDate:dd MMM yyyy}");
                    if (!string.IsNullOrWhiteSpace(bill.VehicleNumber)) c.Item().Text($"Vehicle No: {bill.VehicleNumber}");
                    c.Item().Text($"Passengers: {bill.PassengerCount}");
                    if (!string.IsNullOrWhiteSpace(bill.BoardingPoint)) c.Item().Text($"Boarding: {bill.BoardingPoint}");
                    if (!string.IsNullOrWhiteSpace(bill.DroppingPoint)) c.Item().Text($"Dropping: {bill.DroppingPoint}");
                });
            });

            if (bill.Passengers.Count > 0)
            {
                col.Item().PaddingTop(10).Text("Passenger Details").Bold().FontColor(RoyalBlue);
                col.Item().PaddingTop(4).Table(table =>
                {
                    table.ColumnsDefinition(c =>
                    {
                        c.RelativeColumn(3);
                        c.RelativeColumn(1);
                    });
                    table.Header(h =>
                    {
                        h.Cell().Background(RoyalBlue).Padding(5).Text("Name").FontColor(Colors.White).Bold();
                        h.Cell().Background(RoyalBlue).Padding(5).Text("Seat No").FontColor(Colors.White).Bold();
                    });
                    foreach (var p in bill.Passengers)
                    {
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(p.Name);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(p.SeatNumber ?? "-");
                    }
                });
            }

            col.Item().PaddingTop(14).Table(table =>
            {
                table.ColumnsDefinition(c =>
                {
                    c.RelativeColumn(3);
                    c.RelativeColumn(1.2f);
                });

                table.Header(h =>
                {
                    foreach (var head in new[] { "Description", "Amount" })
                    {
                        h.Cell().Background(RoyalBlue).Padding(6).Text(head).FontColor(Colors.White).Bold().FontSize(9);
                    }
                });

                foreach (var item in bill.Items)
                {
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(item.Description);
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text(item.Amount.ToString("0.00"));
                }
            });

            col.Item().PaddingTop(10).AlignRight().Width(220).Column(c =>
            {
                SummaryRow(c, "Subtotal", bill.Subtotal);
                SummaryRow(c, "Discount", -bill.Discount);
                SummaryRow(c, "Tax", bill.Tax);
                SummaryRow(c, "Other Charges", bill.OtherCharges);

                c.Item().PaddingTop(4).Background(NavyBlue).Padding(8).Row(r =>
                {
                    r.RelativeItem().Text("GRAND TOTAL").FontColor(Colors.White).Bold();
                    r.AutoItem().Text($"Rs. {bill.GrandTotal:0.00}").FontColor(Gold).Bold().FontSize(13);
                });

                SummaryRow(c, "Amount Paid", bill.AmountPaid);
                SummaryRow(c, "Balance Due", bill.BalanceAmount, bold: true);
            });

            col.Item().PaddingTop(30).Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text($"Payment Method: {bill.PaymentMethod}");
                    if (!string.IsNullOrWhiteSpace(bill.TransactionReference))
                        c.Item().Text($"Transaction Ref: {bill.TransactionReference}");
                    if (bill.PaymentDate.HasValue)
                        c.Item().Text($"Payment Date: {bill.PaymentDate:dd MMM yyyy}");
                });

                row.ConstantItem(160).Column(c =>
                {
                    c.Item().PaddingBottom(28).Text("");
                    c.Item().BorderTop(1).BorderColor(Colors.Grey.Lighten1).PaddingTop(3)
                        .AlignCenter().Text("Authorized Signature").FontSize(8).FontColor(Colors.Grey.Darken1);
                });
            });
        });
    }

    private void SummaryRow(ColumnDescriptor c, string label, decimal amount, bool bold = false)
    {
        c.Item().Row(r =>
        {
            var labelText = r.RelativeItem().Text(label).FontSize(10);
            var amountText = r.AutoItem().Text($"Rs. {amount:0.00}").FontSize(10);
            if (bold)
            {
                labelText.Bold();
                amountText.Bold();
            }
            else
            {
                labelText.SemiBold();
                amountText.SemiBold();
            }
        });
    }

    private (string bg, string label) StatusStyle(PaymentStatus status) => status switch
    {
        PaymentStatus.Paid => ("#1E8E3E", "PAID"),
        PaymentStatus.PartiallyPaid => ("#C9A227", "PARTIALLY PAID"),
        PaymentStatus.Cancelled => ("#B00020", "CANCELLED"),
        _ => ("#D97706", "PENDING")
    };

    private void ComposeFooter(IContainer container)
    {
        container.PaddingTop(10).BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(6).Column(c =>
        {
            c.Item().AlignCenter().Text("Thank you for travelling with Narayana Travels.").Italic().FontColor(RoyalBlue).Bold();
            c.Item().AlignCenter().Text("This is a computer-generated invoice.").FontSize(7).FontColor(Colors.Grey.Darken1);
        });
    }
}
