from django.db import models
from django.contrib.auth.models import User
from snippets.macAddress import MACAddressField

class Information(models.Model):
    hid = models.ForeignKey("Host")
    plugin = models.CharField(verbose_name="Plugin",max_length=100)
    dt = models.DateTimeField(verbose_name="Date")
    plugin_key = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True, auto_created=True)
    executed_at = models.DateTimeField()

    class Meta:
        verbose_name = u'Information'
        verbose_name_plural = u'Informations'

    def __unicode__(self):
        return "%s - %s" % (self.hid.name,self.plugin)
    
class Group(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    show = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User)

    class Meta:
        verbose_name = u'Group'
        verbose_name_plural = u'Groups'
    def __unicode__(self):
        return self.name

class Host(models.Model):
    hid = models.CharField(verbose_name="Host ID",max_length=32, unique=True, primary_key=True)
    name = models.CharField(verbose_name="Host name", max_length=100)
    mac = MACAddressField()
    description = models.TextField()
    ip = models.IPAddressField(verbose_name="IP")
    group = models.ForeignKey("Group")
    created = models.DateTimeField(auto_now_add=True, auto_created=True)
    last_update = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User)

    class Meta:
        verbose_name = u'Host'
        verbose_name_plural = u'Hosts'

    def __unicode__(self):
        return self.name + " - " + self.ip