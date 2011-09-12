from django.conf.urls.defaults import *
import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    (r'^admin/', include(admin.site.urls)),
    (r'^$','core.views.index'),
    (r'^comands/', 'core.views.comands'),
    (r'^getGroups/', 'core.views.getGroups'),
    (r'^getHosts/', 'core.views.getHosts'),
    (r'^closeSession/','core.views.closeSession'),
    (r'^getHost/', 'core.views.getHost'),

    url(r'^login/$',  'django.contrib.auth.views.login', {'template_name' : 'login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout_then_login', {'login_url' : '/login/'}, name='logout'),
    
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve',
               {'document_root' : settings.MEDIA_ROOT}),
)
