# Real-ESRGAN general x4v3 (SRVGGNetCompact) upscaler. As a script it upscales a video (raw frames from ffmpeg in, to ffmpeg out);
# scripts/prepare-finishing.py imports load() and upscale() for photos.
import os, sys, subprocess, numpy as np, torch, torch.nn as nn, torch.nn.functional as F
class SRVGG(nn.Module):
    def __init__(s, nf=64, nc=32, up=4):
        super().__init__(); s.up=up
        b=[nn.Conv2d(3,nf,3,1,1), nn.PReLU(nf)]
        for _ in range(nc): b += [nn.Conv2d(nf,nf,3,1,1), nn.PReLU(nf)]
        b += [nn.Conv2d(nf,3*up*up,3,1,1)]
        s.body=nn.ModuleList(b); s.ps=nn.PixelShuffle(up)
    def forward(s,x):
        o=x
        for m in s.body: o=m(o)
        return s.ps(o)+F.interpolate(x,scale_factor=s.up,mode='nearest')
def load():
    m=SRVGG(); sd=torch.load(os.environ.get('SR_WEIGHTS', os.path.join(os.path.dirname(__file__), '.cache', 'realesr-general-x4v3.pth')),map_location='cpu',weights_only=True); m.load_state_dict(sd.get('params',sd)); m.eval()
    return m.to(memory_format=torch.channels_last)
def upscale(m, rgb):
    """rgb: HxWx3 uint8 array; returns the 4x upscaled array, processed in tiles to bound memory."""
    h,w,_=rgb.shape; T=256; P=12; out=np.zeros((h*4,w*4,3),np.uint8)
    x=torch.from_numpy(rgb.copy()).permute(2,0,1)[None].float()/255
    with torch.inference_mode():
        for y0 in range(0,h,T):
            for x0 in range(0,w,T):
                ya,xa=max(0,y0-P),max(0,x0-P); yb,xb=min(h,y0+T+P),min(w,x0+T+P)
                with torch.autocast('cpu',dtype=torch.bfloat16):
                    y=m(x[:,:,ya:yb,xa:xb].contiguous(memory_format=torch.channels_last)).float()
                y=y.clamp(0,1)[0].permute(1,2,0).mul(255).round().byte().numpy()
                ty,tx=(y0-ya)*4,(x0-xa)*4; hh,ww=(min(h,y0+T)-y0)*4,(min(w,x0+T)-x0)*4
                out[y0*4:y0*4+hh,x0*4:x0*4+ww]=y[ty:ty+hh,tx:tx+ww]
    return out
if __name__ == '__main__':
    src, dst, w, h, ss, t, fps = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5], sys.argv[6], sys.argv[7]
    # crop region given as w:h:x:y in sys.argv[8]
    crop = sys.argv[8]
    torch.set_num_threads(4)
    # bfloat16 + channels-last runs ~3x faster on CPUs with AMX/AVX-512 BF16, with no visible difference.
    m=load()
    cw,ch=[int(v) for v in crop.split(':')[:2]]
    dec=subprocess.Popen(['ffmpeg','-v','error','-ss',ss,'-t',t,'-i',src,'-vf',f'fps={fps},crop={crop}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
    enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{cw*4}x{ch*4}','-r',fps,'-i','-','-vf',f'scale={w}:{h}:flags=lanczos','-c:v','libx264','-crf','16','-preset','medium','-pix_fmt','yuv420p',dst],stdin=subprocess.PIPE)
    n=0
    with torch.inference_mode():
        while True:
            buf=dec.stdout.read(cw*ch*3)
            if len(buf)<cw*ch*3: break
            x=torch.from_numpy(np.frombuffer(buf,np.uint8).reshape(ch,cw,3).copy()).permute(2,0,1)[None].float()/255
            with torch.autocast('cpu',dtype=torch.bfloat16):
                y=m(x.to(memory_format=torch.channels_last)).float()
            y=y.clamp(0,1)[0].permute(1,2,0).mul(255).round().byte().numpy()
            enc.stdin.write(y.tobytes()); n+=1
    enc.stdin.close(); enc.wait(); print(dst,n,'frames')
