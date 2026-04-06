using CmsPro.API;
using CmsPro.Application.Interfaces;
using CmsPro.Domain.Entities;
using CmsPro.Infrastructure.Persistence;
using CmsPro.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.User.RequireUniqueEmail = true;
}).AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddScoped<TestimonialRoutes>();
builder.Services.AddScoped<ITestimonyRepository, TestimonialService>();
builder.Services.AddValidation();
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(opts =>
    {
        opts.SwaggerEndpoint("/openapi/v1.json", "OpenApi");
    });
}

app.MapTestimonial();

app.Run();
