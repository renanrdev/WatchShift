﻿// <auto-generated />
using System;
using ComplianceMonitor.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ComplianceMonitor.Infrastructure.Migrations
{
    [DbContext(typeof(ComplianceDbContext))]
    partial class ComplianceDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.Alert", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<bool>("Acknowledged")
                        .HasColumnType("boolean");

                    b.Property<DateTime?>("AcknowledgedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("AcknowledgedBy")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<Guid>("ComplianceCheckId")
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp");

                    b.HasKey("Id");

                    b.HasIndex("Acknowledged");

                    b.HasIndex("ComplianceCheckId");

                    b.ToTable("Alerts", (string)null);
                });

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.ComplianceCheck", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Details")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<Guid>("PolicyId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("ResourceId")
                        .HasColumnType("uuid");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("timestamp");

                    b.HasKey("Id");

                    b.HasIndex("PolicyId");

                    b.HasIndex("ResourceId");

                    b.HasIndex("Status");

                    b.ToTable("ComplianceChecks", (string)null);
                });

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.ImageScanResult", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("ImageName")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<string>("Metadata")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("ScanTime")
                        .HasColumnType("timestamp");

                    b.HasKey("Id");

                    b.HasIndex("ImageName");

                    b.ToTable("ImageScans", (string)null);
                });

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.KubernetesResource", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Annotations")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Kind")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("Labels")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(253)
                        .HasColumnType("character varying(253)");

                    b.Property<string>("Namespace")
                        .IsRequired()
                        .HasMaxLength(253)
                        .HasColumnType("character varying(253)");

                    b.Property<string>("Spec")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Uid")
                        .IsRequired()
                        .HasMaxLength(36)
                        .HasColumnType("character varying(36)");

                    b.HasKey("Id");

                    b.HasIndex("Kind");

                    b.HasIndex("Namespace");

                    b.HasIndex("Uid")
                        .IsUnique();

                    b.ToTable("Resources", (string)null);
                });

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.Policy", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("text");

                    b.Property<bool>("IsEnabled")
                        .HasColumnType("boolean");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(200)");

                    b.Property<string>("Parameters")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("RuleType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Severity")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("IsEnabled");

                    b.HasIndex("Name");

                    b.HasIndex("RuleType");

                    b.ToTable("Policies", (string)null);
                });

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.Vulnerability", b =>
                {
                    b.Property<Guid>("Id")
                        .HasMaxLength(100)
                        .HasColumnType("uuid");

                    b.Property<Guid>("ImageScanResultId")
                        .HasColumnType("uuid");

                    b.Property<double?>("CvssScore")
                        .HasColumnType("double precision");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(2000)
                        .HasColumnType("character varying(2000)");

                    b.Property<string>("FixedVersion")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("InstalledVersion")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("PackageName")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)");

                    b.Property<string>("References")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Severity")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id", "ImageScanResultId");

                    b.HasIndex("ImageScanResultId");

                    b.HasIndex("Severity");

                    b.ToTable("Vulnerabilities", (string)null);
                });

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.Alert", b =>
                {
                    b.HasOne("ComplianceMonitor.Domain.Entities.ComplianceCheck", "ComplianceCheck")
                        .WithMany()
                        .HasForeignKey("ComplianceCheckId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ComplianceCheck");
                });

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.ComplianceCheck", b =>
                {
                    b.HasOne("ComplianceMonitor.Domain.Entities.Policy", "Policy")
                        .WithMany()
                        .HasForeignKey("PolicyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ComplianceMonitor.Domain.Entities.KubernetesResource", "Resource")
                        .WithMany()
                        .HasForeignKey("ResourceId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Policy");

                    b.Navigation("Resource");
                });

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.Vulnerability", b =>
                {
                    b.HasOne("ComplianceMonitor.Domain.Entities.ImageScanResult", "ImageScanResult")
                        .WithMany("Vulnerabilities")
                        .HasForeignKey("ImageScanResultId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ImageScanResult");
                });

            modelBuilder.Entity("ComplianceMonitor.Domain.Entities.ImageScanResult", b =>
                {
                    b.Navigation("Vulnerabilities");
                });
#pragma warning restore 612, 618
        }
    }
}
