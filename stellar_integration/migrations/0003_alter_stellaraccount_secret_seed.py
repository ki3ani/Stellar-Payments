# Generated by Django 5.1 on 2024-08-18 21:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stellar_integration', '0002_userprofile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stellaraccount',
            name='secret_seed',
            field=models.CharField(max_length=256),
        ),
    ]
